from boto3 import session
from mimetypes import MimeTypes
from config import s3_options

def s3_upload(bucket, obj, path):
    s = session.Session()
    client = s.client('s3', **s3_options)

    mime = MimeTypes()
    mime_type, enc = mime.guess_type(obj)

    # Upload a file to your Space
    client.upload_file(path, bucket, obj, ExtraArgs={
        'ACL': 'public-read',
        'ContentType': mime_type,
    })
