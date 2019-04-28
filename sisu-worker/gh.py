import rhinoscriptsyntax as rs
import Rhino
import os
import json
from rhino import script_start, script_end, open_file, save_file, get_config, save_result


def gh_run(script, run_solver):
    #rs.Command('-_Grasshopper "{}" _Enter'.format(script))
    rs.Command("_Grasshopper")

    gh = Rhino.RhinoApp.GetPlugInObject("Grasshopper")
    gh.OpenDocument(script)
    if run_solver:
        gh.RunSolver(script)
    gh.CloseAllDocuments()


def main():
    config = get_config()

    script = config['grasshopperScript']
    filename = config['filename']
    out_dir = config['outputDir']
    out_file = config['outputFile']
    run_solver = config.get('runSolver', False)
    out_filename = os.path.join(out_dir, out_file) 
    script_start()

    s = open_file(filename)

    gh_run(script, run_solver)
    save_file(out_filename)    

    result = {
        'outputFilename': out_filename,
    }

    save_result(result)
    script_end()


if __name__ == '__main__':
    main()
