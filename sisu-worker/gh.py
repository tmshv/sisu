import rhinoscriptsyntax as rs
import Rhino
import os

f = os.path.expanduser("~/Desktop/run_gh/sample.gh")
f = os.path.normpath(f)

out_file = os.path.expanduser('~/Desktop/run_gh/sample_out.3dm')
out_file = os.path.normpath(out_file)

#rs.Command('-_Grasshopper "{}" _Enter'.format(f))
rs.Command("_Grasshopper")

gh = Rhino.RhinoApp.GetPlugInObject("Grasshopper")
#gh.RunSolver(f)
gh.OpenDocument(f)
gh.CloseAllDocuments()

rs.Command('-_Save {}'.format(out_file))

#print(dir(gh))