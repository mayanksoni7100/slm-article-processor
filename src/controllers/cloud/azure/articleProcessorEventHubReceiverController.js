var {
    EVENTHUB_CONSUMER_ALREADY_RUNNING,
    EVENTHUB_CONSUMER_CREATION,
    EVENTHUB_CONSUMER_EVENT_RECEIVED,
    EVENTHUB_CONSUMER_FROM_PARTITION,
    EVENTHUB_CONSUMER_FROM_GROUP,
    EVENTHUB_CONSUMER_START_SUCCESS,
    EVENTHUB_CONSUMER_STOP_SUCCESS,
    EVENTHUB_CONSUMER_ALREADY_STOPED,
    EVENTHUB_CONSUMER_VALIDATION_OPERATION_TYPE,
} = require('../../../utilities/constants')
var { generateResponseObject } = require('../../../utilities/utilities')
const { ContainerClient } = require("@azure/storage-blob");
const { BlobCheckpointStore } = require("@azure/eventhubs-checkpointstore-blob");
const { EventHubConsumerClient, earliestEventPosition } = require("@azure/event-hubs");

const connectionString = `Endpoint=sb://${process.env.APISERVICE_AZURE_EVENT_HUB_ENDPOINT}/;SharedAccessKeyName=${process.env.APISERVICE_AZURE_EVENT_HUB_SHARED_ACCESSKEY_NAME};SharedAccessKey=${process.env.APISERVICE_AZURE_EVENT_HUB_SHARED_ACCESSKEY}`;
const eventHubName = process.env.APISERVICE_AZURE_UPDATE_ARTICLES_EVENT_HUB_NAME;
const consumerGroup = process.env.APISERVICE_AZURE_EVENT_HUB_CONSUMER_GROUP;

const storageConnectionString = `DefaultEndpointsProtocol=${process.env.APISERVICE_AZURE_STORAGE_ENDPOINTS_PROTOCOL};AccountName=${process.env.APISERVICE_AZURE_STORAGE_ACCOUNT_NAME};AccountKey=${process.env.APISERVICE_AZURE_STORAGE_ACCOUNT_KEY};EndpointSuffix=${process.env.APISERVICE_AZURE_STORAGE_ENDPOINTS_SUFFIX}`;
const containerName = process.env.APISERVICE_AZURE_UPDATE_ARTICLES_EVENT_HUB_CHECKPOINT_CONTAINER ;

function articleProcessorEventHubReceiverController() {
    return this;
}

articleProcessorEventHubReceiverController.prototype.receiveEvents = function (consumerOperation, callback) {
    const {
        operationType = ''
    } = consumerOperation;
    try {
        (async function () {
            if (operationType == 'start') {
                if(global.articleProcessEventSubscription && global.articleProcessEventConsumerClient){
                    callback(generateResponseObject('001', EVENTHUB_CONSUMER_ALREADY_RUNNING));
                }

                // Create a blob container client and a blob checkpoint store using the client.
                const containerClient = new ContainerClient(storageConnectionString, containerName);
                const checkpointStore = new BlobCheckpointStore(containerClient);
                
                logger.info(EVENTHUB_CONSUMER_CREATION);
                global.articleProcessEventConsumerClient = new EventHubConsumerClient(consumerGroup, connectionString, eventHubName, checkpointStore);
                global.articleProcessEventSubscription = articleProcessEventConsumerClient.subscribe(
                    {
                        processEvents: async (events, context) => {
                            logger.info(`events count:  ${events.length}`);
                            for (const event of events) {
                                try {
                                    logger.info(`******************* [ARTICLE-PROCESS] - ${EVENTHUB_CONSUMER_EVENT_RECEIVED} ******************`);
                                    logger.info(`[ARTICLE-PROCESS] - '${JSON.stringify(event)}' ${EVENTHUB_CONSUMER_FROM_PARTITION}: '${context.partitionId}' ${EVENTHUB_CONSUMER_FROM_GROUP}: '${context.consumerGroup}'`);
                                } catch (e) {
                                    logger.error(`******************* [ARTICLE-PROCESS] - ${EVENTHUB_CONSUMER_EVENT_RECEIVED} ******************`);
                                    logger.error(`[ARTICLE-PROCESS] - '${event}' ${EVENTHUB_CONSUMER_FROM_PARTITION}: '${context.partitionId}' ${EVENTHUB_CONSUMER_FROM_GROUP}: '${context.consumerGroup}'`);
                                }
                            }
                            if (events.length === 0) {
                                logger.info(`No events received within wait time. Waiting for next interval`);
                                return;
                              }
                            // Update the checkpoint.
                            await context.updateCheckpoint(events[events.length - 1]);
                            logger.info('[ARTICLE-PROCESS] - Last Received Event Marked in Storage Account');
                        },
                        processError: async (err, context) => {
                            if(err.message.indexOf(`If you are recreating the receiver, make sure a higher epoch is used`) != -1){
                            }else{
                                logger.error(err);
                            }
                        }
                    },
                    { 
                        startPosition: earliestEventPosition,
                        maxBatchSize: parseInt(process.env.EVENT_HUB_ARTICLE_PROCESS_RECEIVER_BATCH_SIZE)
                    }
                );

                callback(generateResponseObject('000', `[ARTICLE-PROCESS] -  ${EVENTHUB_CONSUMER_START_SUCCESS}`));

            } else if (operationType == 'stop') {
                if(global.articleProcessEventSubscription && global.articleProcessEventConsumerClient){
                    await global.articleProcessEventSubscription.close();
                    await global.articleProcessEventConsumerClient.close();
                    global.articleProcessEventSubscription = '';
                    global.articleProcessEventConsumerClient = '';
                    logger.info(`[ARTICLE-PROCESS] -  ${EVENTHUB_CONSUMER_STOP_SUCCESS}`);
                    callback(generateResponseObject('002', `[ARTICLE-PROCESS] -  ${EVENTHUB_CONSUMER_STOP_SUCCESS}`));
                } else {
                    callback(generateResponseObject('003', `[ARTICLE-PROCESS] -  ${EVENTHUB_CONSUMER_ALREADY_STOPED}`));
                }

            } else {
                callback(generateResponseObject('004', `[ARTICLE-PROCESS] -  ${EVENTHUB_CONSUMER_VALIDATION_OPERATION_TYPE}`));
            }
        })();
    } catch (error) {
        callback(generateResponseObject('005', error));
    }
}

module.exports = articleProcessorEventHubReceiverController;