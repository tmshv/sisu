import os
import json
import uuid
import pika

queue = 'sisu'
host = 'sisu.unit4.io'
port = 9156


class RpcClient(object):
    def __init__(self, host, port):
        self.correlation_id = None
        params = pika.ConnectionParameters(host=host, port=port)
        self.connection = pika.BlockingConnection(params)
        self.channel = self.connection.channel()

        response_queue = self.channel.queue_declare(exclusive=True)
        self.callback_queue = response_queue.method.queue
        self.channel.basic_consume(
            self.on_response, no_ack=True, queue=self.callback_queue)

    def on_response(self, ch, method, props, body):
        if self.correlation_id == props.correlation_id:
            self.response = body

    def call(self, message):
        self.create_correlation_id()
        body = json.dumps(message)
        properties = pika.BasicProperties(
            reply_to=self.callback_queue,
            correlation_id=self.correlation_id,
        )
        self.response = None
        self.channel.basic_publish(exchange='',
                                   routing_key=queue,
                                   properties=properties,
                                   body=body)
        while self.response is None:
            self.connection.process_data_events()
        return json.loads(self.response)

    def close(self):
        self.connection.close()

    def create_correlation_id(self):
        self.correlation_id = str(uuid.uuid4())


def create_rpc():
    return RpcClient(host=host, port=port)
