import configparser

config = configparser.ConfigParser()
config.read('config.ini')

s3_options = {
    'region_name': config['s3']['region_name'],
    'endpoint_url': config['s3']['endpoint_url'],
    'aws_access_key_id': config['s3']['client_id'],
    'aws_secret_access_key': config['s3']['client_secret'],
}
