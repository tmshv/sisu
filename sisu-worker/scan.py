from glob import glob
import json

pattern = 'U:/RU Moscow A101 Scandinavia/Stage II/**/DWG/*.dwg'

files = glob(pattern, recursive=True)

with open('sisu_scan_out.json', 'wb') as f:
	data = {
		'files': files,
	}
	raw = json.dumps(data, indent=4, ensure_ascii=False)
	f.write(raw.encode('utf-8'))
