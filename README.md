# Content of the repository

The visualisation has been done using html, javascript and the d3 module. Everything needed except the patient data has been put in the repository, including the code, a demo and the project report, as well as the needed media files.

The data of the cancer patients (which is an open-source database), must be downloaded from the GDC data portal and transformed into one "data.json" file. This preprocessing can be done using the jupyter notebook "script_pre_processing.ipynb". This "data.json" file must then be copied in the /data file to be found by the script. 

Careful : the preprocessing jupyter notebook must be run in a file with the "manifest.txt" and a "data" file containing all the patients files. Those files will be created when downloading patients from the GDC data portal. 
