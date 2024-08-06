const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableNameGuns = 'Guns';
const tableNamePerks = 'Perks';
const tableNameLoadouts = 'Loadouts';

exports.handler = async (event) => {
    const httpMethod = event.httpMethod;
    const path = event.path;
    let response;

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
                response = await createItem(tableNameGuns, JSON.parse(event.body));
            } else if (path === '/perks') {
                response = await createItem(tableNamePerks, JSON.parse(event.body));
            } else if (path === '/loadouts') {
                response = await createItem(tableNameLoadouts, JSON.parse(event.body));
            }
            break;
        case 'PUT':
            const updateData = JSON.parse(event.body);
            if (path.startsWith('/guns/')) {
                response = await updateItem(tableNameGuns, updateData.GunID, updateData);
            } else if (path.startsWith('/perks/')) {
                response = await updateItem(tableNamePerks, updateData.PerkID, updateData);
            } else if (path.startsWith('/loadouts/')) {
                response = await updateItem(tableNameLoadouts, updateData.LoadoutID, updateData);
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

    return {
        statusCode: response.statusCode || 200,
        body: JSON.stringify(response.body || response),
        headers: { 'Content-Type': 'application/json' }
    };
};

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
