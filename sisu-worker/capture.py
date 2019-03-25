import rhinoscriptsyntax as rs
import scriptcontext as sc
import Rhino
import os
import json


def create_screenshot(view, file):
    rs.ZoomExtents(view, False)
    rs.CurrentView(view)
    
    comm = '-_ViewCaptureToFile {file}'.format(file=file)
    
    rs.Command(comm, False)


def main():
    task_file = os.path.expanduser('~/Desktop/sisu_task.json')
    files_dir = os.path.expanduser('~/Desktop/screenshots')
    file_id = task['fileId']
    screenshot = os.path.join(files_dir, '{}.png'.format(file_id))
    
    create_screenshot('Top', screenshot)
    
    
# save all named views to jpg via view capture to file

import rhinoscriptsyntax as rs

def capture_named_views():
    all_views = rs.NamedViews()
    selected_views= rs.MultiListBox(all_views)
    filename_base = rs.GetString("base file name","Rics_file_")
    
    for view_name in selected_views:
        rs.RestoreNamedView(view_name)
        rs.Command('-_ViewCaptureToFile '+chr(34)+filename_base+view_name+'.jpg'+chr(34)+' _EnterEnd')
        
        
# request
{
    'token': token,
    'projectId': pid,
    'fileId': file_id,
    'filename': filename,
    'screenshot': {
        'viewport': 'Top',
        'namedView': 'Named View 01',
        'width': 1200,
        'height': 900,
    },
}


# response
{
    'filename': 'filename.png',
}
#filename.png

# upload to https://github.com/tmshv/sisu/tree/master/sisu-worker
