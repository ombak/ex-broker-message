'use strict';

import { Queue, Worker, FlowProducer } from 'bullmq';
import { isEmpty } from '../utils/utils.js';


export default class BrokerMessage {
    //...constructor
    constructor() {
        this.host = process.env.REDIS_HOST;
        this.port = process.env.REDIS_PORT;
        this.password = process.env.REDIS_PASSWORD;
    }

    // create connection
    async #createConnection() {
        const CONNECTOR = {
            host: this.host,
            port: this.port,
            password: this.password
        }

        // set default option for queue
        const DEFAULT_CONFIG = {
            attempts: 3, // do 3 attemp when failed
            backoff: {
                type: 'exponential',
                delay: 1000
            },
            removeOnComplete: {
                age: 300,
                count: 500
            },
            removeOnFail: 1000
        }

        return { CONNECTOR, DEFAULT_CONFIG }
    }

    //...create queue
    async #createQueue(name, job) {
        const _myConnection = await this.#createConnection();

        //...create queue
        const _queue = new Queue(name, {
            defaultJobOptions: _myConnection.DEFAULT_CONFIG,
            connection: _myConnection.CONNECTOR
        })

        return _queue.add(
            job.name,
            job.payload
        )
    }

    // create work
    async #createWorker(name, processor) {
        const _myConnection = await this.#createConnection();

        // create worker
        const _worker = new Worker(
            name,
            processor,
            {
                connection: _myConnection.CONNECTOR
            }
        )

        _worker.on('active', job => {
            console.debug(`Processing job with id ${job.id}`);
        })

        _worker.on('completed', (job, returnValue) => {
            console.debug(`Completed job with id ${job.id}`, returnValue);
        })

        _worker.on('error', failedReason => {
            console.error(`Job encountered an error`, failedReason);
            throw new Error('Error');
        })

        return _worker;
    }

    // create broker for process the message
    async createBroker(name, job, processor) {
        //...create queue
        const _queue = await this.#createQueue(name, job);

        if (! await isEmpty(_queue)) {
            return await this.#createWorker(name, processor);
        }

        return {}
    }

    // create flow
    async createFlow(data, processor) {
        const { _nameRoot, _queueName, _data, _childrens } = data;
        const _myConnection = await this.#createConnection();

        const _fflow = new FlowProducer({
            connection: _myConnection.CONNECTOR
        })

        // create the tree
        const _processFlow = await _fflow.add({
            name: _nameRoot,
            queueName: _queueName,
            data: _data,
            children: _childrens
        })

        if (! await isEmpty(_processFlow)) {
            return await this.#createWorker(_queueName, processor)
        }

        return {}
    }
}