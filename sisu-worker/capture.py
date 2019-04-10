import rhinoscriptsyntax as rs
import scriptcontext as sc
import Rhino
import os
import json
# создать скриншот Top/Left/Right/Front окна
def create_screenshot(view, file):
    rs.ZoomExtents(view, False)
    rs.CurrentView(view)
    
    comm = '-_ViewCaptureToFile {file}'.format(file=file)
    
    rs.Command(comm, False)
# функция мэйн
def main():
    task_file = os.path.expanduser('~/Desktop/sisu_task.json')
    files_dir = os.path.expanduser('~/Desktop/screenshots')
    
    with open(task_file, 'r') as read_file:
        data = json.load(read_file)
    
    file_id = data["fileId"]
    screenshot = os.path.join(files_dir, '{}.png'.format(file_id))
    
    create_screenshot('Top', screenshot)
    capture_named_views()
# сделать скриншот NamedView, пока что без параметров, когда будет 
# польностью готов json - можно будет добавить аргументы
def capture_named_views():
    all_views = rs.NamedViews()
    selected_views= rs.MultiListBox(all_views)
    filename_base = os.path.expanduser('~/Desktop/screenshots/')
    
    for view_name in selected_views:
        rs.RestoreNamedView(view_name)
        rs.Command('-_ViewCaptureToFile '+chr(34)+filename_base+view_name+'.jpg'+chr(34)+' _EnterEnd')

if __name__== "__main__":
    main()
        
        
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
