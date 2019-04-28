import json
import sys
import core

handler = core.create_handler()


def main(msg):
    result = core.handle_message(handler, msg)

    print(json.dumps(result, indent=4))


if __name__ == '__main__':
    json_file = sys.argv[1]
    data = json.load(open(json_file, 'r'))

    try:
        main(data)
    except KeyboardInterrupt:
        exit()
