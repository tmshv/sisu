import rhinoscriptsyntax as rs
import Rhino
import os
import json
from rhino import script_start, script_end, open_file, save_file, get_config, save_result


def gh_run(script):
    #rs.Command('-_Grasshopper "{}" _Enter'.format(script))
    rs.Command("_Grasshopper")

    gh = Rhino.RhinoApp.GetPlugInObject("Grasshopper")
    #gh.RunSolver(script)
    gh.OpenDocument(script)
    gh.CloseAllDocuments()


def main():
    config = get_config()

    script = config['grasshopprtScript']
    filename = config['filename']
    out_filename = config['outputFile']
 
    script_start()

    s = open_file(filename)

    gh_run(script)
    save_file(out_filename)    

    result = {
    }

    save_result(result)
    script_end()


if __name__ == '__main__':
    main()
