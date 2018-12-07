import pika
import json
import sys
import os
from glob import glob

import core


def callback(ch, method, properties, body):
    try:
        msg = json.loads(body)
        action = msg['action']

        print('> Action', action)

        result = core.handle_message(msg)

        if not result:
            print('> Cannot handle action', action)
        else:
            print(result)

        # ch.basic_ack(delivery_tag = method.delivery_tag)
    except Exception as e:
        print('> failed to handle message', body)
        print(e)


if __name__ == '__main__':
    queue = 'sisu'
    host = sys.argv[1]
    port = int(sys.argv[2])
    params = pika.ConnectionParameters(host, port, '/')
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue=queue)

    channel.basic_consume(callback, queue=queue, no_ack=True)

    print('Waiting for messages. To exit press CTRL+C')

    channel.start_consuming()
