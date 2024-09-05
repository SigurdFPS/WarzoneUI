const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { getItems, getItem, createItem, updateItem, deleteItem } = require('./dynamoHelpers');
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_ID = 'CLIENT_ID_HERE';
const CLIENT_SECRET = 'CLIENT_SECRET_HERE';
const REDIRECT_URI = 'REDIRECT_URI_HERE';

const tableNameGuns = 'Guns';
const tableNamePerks = 'Perks';
const tableNameLoadouts = 'Loadouts';

let loadouts = {}; // In-memory store for loadouts

// Middleware
app.use(bodyParser.json());

// Routes for Guns, Perks, and Loadouts
app.all('*', async (req, res) => {
    const httpMethod = req.method;
    const path = req.path;
    let response;

    try {
        switch (httpMethod) {
            case 'GET':
                if (path === '/guns') {
                    response = await getItems(tableNameGuns);
                } else if (path.startsWith('/guns/')) {
                    const gunID = path.split('/')[2];
                    response = await getItem(tableNameGuns, gunID);
                } else if (path === '/perks') {
                    response = await getItems(tableNamePerks);
                } else if (path.startsWith('/perks/')) {
                    const perkID = path.split('/')[2];
                    response = await getItem(tableNamePerks, perkID);
                } else if (path === '/loadouts') {
                    response = await getItems(tableNameLoadouts);
                } else if (path.startsWith('/loadouts/')) {
                    const loadoutID = path.split('/')[2];
                    response = await getItem(tableNameLoadouts, loadoutID);
                }
                break;
            case 'POST':
                if (path === '/guns') {
                    response = await createItem(tableNameGuns, req.body);
                } else if (path === '/perks') {
                    response = await createItem(tableNamePerks, req.body);
                } else if (path === '/loadouts') {
                    response = await createItem(tableNameLoadouts, req.body);
                }
                break;
            case 'PUT':
                const updateData = req.body;
                if (path.startsWith('/guns/')) {
                    const gunID = path.split('/')[2];
                    response = await updateItem(tableNameGuns, gunID, updateData);
                } else if (path.startsWith('/perks/')) {
                    const perkID = path.split('/')[2];
                    response = await updateItem(tableNamePerks, perkID, updateData);
                } else if (path.startsWith('/loadouts/')) {
                    const loadoutID = path.split('/')[2];
                    response = await updateItem(tableNameLoadouts, loadoutID, updateData);
                }
                break;
            case 'DELETE':
                if (path.startsWith('/guns/')) {
                    const gunID = path.split('/')[2];
                    response = await deleteItem(tableNameGuns, gunID);
                } else if (path.startsWith('/perks/')) {
                    const perkID = path.split('/')[2];
                    response = await deleteItem(tableNamePerks, perkID);
                } else if (path.startsWith('/loadouts/')) {
                    const loadoutID = path.split('/')[2];
                    response = await deleteItem(tableNameLoadouts, loadoutID);
                }
                break;
            default:
                response = { statusCode: 405, body: 'Method Not Allowed' };
        }
    } catch (error) {
        response = { statusCode: 500, body: error.message };
    }

    res.status(response.statusCode || 200).json(response.body || response);
});

// Routes for Loadouts
app.post('/create_loadout', (req, res) => {
    const data = req.body;
    const loadout_id = Object.keys(loadouts).length + 1;
    loadouts[loadout_id] = data;
    res.json({ loadout_id, status: 'success' });
});

app.put('/update_loadout/:loadout_id', (req, res) => {
    const loadout_id = parseInt(req.params.loadout_id, 10);
    if (loadouts[loadout_id]) {
        loadouts[loadout_id] = req.body;
        res.json({ status: 'success' });
    } else {
        res.status(404).json({ status: 'error', message: 'Loadout not found' });
    }
});

app.delete('/delete_loadout/:loadout_id', (req, res) => {
    const loadout_id = parseInt(req.params.loadout_id, 10);
    if (loadouts[loadout_id]) {
        delete loadouts[loadout_id];
        res.json({ status: 'success' });
    } else {
        res.status(404).json({ status: 'error', message: 'Loadout not found' });
    }
});

app.get('/get_loadouts', (req, res) => {
    res.json(loadouts);
});

// Twitch Authentication
app.get('/twitch_auth', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).send('Missing code');
    }

    const token_url = 'https://id.twitch.tv/oauth2/token';
    const params = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI
    };

    try {
        const response = await axios.post(token_url, null, { params });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Helper Functions for DynamoDB Operations
async function getItems(tableName) {
    const params = { TableName: tableName };
    const result = await dynamoDb.scan(params).promise();
    return { body: result.Items };
}

async function getItem(tableName, itemId) {
    const params = {
        TableName: tableName,
        Key: { [`${tableName.slice(0, -1)}ID`]: itemId }
    };
    const result = await dynamoDb.get(params).promise();
    return { body: result.Item };
}

async function createItem(tableName, item) {
    const params = {
        TableName: tableName,
        Item: item
    };
    await dynamoDb.put(params).promise();
    return { body: item };
}

async function updateItem(tableName, itemId, itemData) {
    const updateExpression = Object.keys(itemData).map(key => `#${key} = :${key}`).join(', ');
    const expressionAttributeNames = Object.keys(itemData).reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {});
    const expressionAttributeValues = Object.keys(itemData).reduce((acc, key) => ({ ...acc, [`:${key}`]: itemData[key] }), {});

    const params = {
        TableName: tableName,
        Key: { [`${tableName.slice(0, -1)}ID`]: itemId },
        UpdateExpression: `SET ${updateExpression}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'UPDATED_NEW'
    };
    const result = await dynamoDb.update(params).promise();
    return { body: result.Attributes };
}

async function deleteItem(tableName, itemId) {
    const params = {
        TableName: tableName,
        Key: { [`${tableName.slice(0, -1)}ID`]: itemId }
    };
    await dynamoDb.delete(params).promise();
    return { body: `Deleted item with ID: ${itemId}` };
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
