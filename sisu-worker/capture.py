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
    
    with open(task_file, 'r') as read_file:
        data = json.load(read_file)
    
    file_id = data["fileId"]
    screenshot = os.path.join(files_dir, '{}.png'.format(file_id))
    
    create_screenshot('Top', screenshot)
    capture_named_views()
def capture_named_views():
    all_views = rs.NamedViews()
    selected_views= rs.MultiListBox(all_views)
    filename_base = os.path.expanduser('~/Desktop/screenshots/')
    
    for view_name in selected_views:
        rs.RestoreNamedView(view_name)
        comm = '-_ViewCaptureToFile "{}{}.jpg" _EnterEnd'.format(filename_base,view_name)
        rs.Command(comm)

if __name__== "__main__":
    main()
