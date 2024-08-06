const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function getItems(tableName) {
    const params = { TableName: tableName };
    try {
        const result = await dynamoDb.scan(params).promise();
        return { statusCode: 200, body: result.Items };
    } catch (error) {
        return { statusCode: 500, body: error.message };
    }
}

async function getItem(tableName, itemId) {
    const params = {
        TableName: tableName,
        Key: { [`${tableName.slice(0, -1)}ID`]: itemId }
    };
    try {
        const result = await dynamoDb.get(params).promise();
        return { statusCode: 200, body: result.Item };
    } catch (error) {
        return { statusCode: 500, body: error.message };
    }
}

async function createItem(tableName, item) {
    const params = {
        TableName: tableName,
        Item: item
    };
    try {
        await dynamoDb.put(params).promise();
        return { statusCode: 200, body: item };
    } catch (error) {
        return { statusCode: 500, body: error.message };
    }
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
    try {
        const result = await dynamoDb.update(params).promise();
        return { statusCode: 200, body: result.Attributes };
    } catch (error) {
        return { statusCode: 500, body: error.message };
    }
}

async function deleteItem(tableName, itemId) {
    const params = {
        TableName: tableName,
        Key: { [`${tableName.slice(0, -1)}ID`]: itemId }
    };
    try {
        await dynamoDb.delete(params).promise();
        return { statusCode: 200, body: `Deleted item with ID: ${itemId}` };
    } catch (error) {
        return { statusCode: 500, body: error.message };
    }
}

module.exports = {
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem
};
