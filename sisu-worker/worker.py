import pika
import json
import sys

import core


handler = core.create_handler()


def callback(ch, method, props, body):
    try:
        msg = json.loads(body)
        action = msg['action']

        print('> Action', action)

        result = core.handle_message(handler, msg)
        body = json.dumps(result)
        properties = pika.BasicProperties(correlation_id=props.correlation_id)
        ch.basic_publish(
            exchange='',
            routing_key=props.reply_to,
            properties=properties,
            body=body
        )
        ch.basic_ack(delivery_tag=method.delivery_tag)

        print('< Result', result)
    except Exception as e:
        print('> failed to handle message', body)
        print(e)


def main():
    # vhost = 'sisu'
    queue = 'sisu'
    host = sys.argv[1]
    port = int(sys.argv[2])
    username = sys.argv[3]
    password = sys.argv[4]
    credentials=pika.PlainCredentials(username=username, password=password)
    params = pika.ConnectionParameters(
        host=host,
        port=port,
        # virtual_host=vhost,
        credentials=credentials,
    )
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue=queue)
    channel.basic_qos(prefetch_count=1)

    print('Waiting for messages. To exit press CTRL+C')
    channel.basic_consume(queue, callback)
    channel.start_consuming()


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        exit()
