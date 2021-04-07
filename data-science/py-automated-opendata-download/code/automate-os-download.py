"""
This script allows users to keep their OS data directory up-to-date by using the OS Download API to check product version dates
and download new datasets when required.  A .bat file can be used alongside to automate when this script is run.

It is recommended that the python script and Products csv file are placed in the same folder as your OS data.

Aims:
1. Read in Products.csv 
2. Collect latest product information using API
3. Merge the above two data sources into a single dataframe - joining on ID column
4. Compare user version date to product version date - if product version date is greater then an update is available
5. Individual URLs are created by using 'downloadsUrl' and 'fileName' elements from API requests, and data format and area coverage from user input (csv file)
6. All zip files are extracted and then removed in Step 3

Script tested using python v3.9 & requires pandas.

"""
import os
import pandas as pd
import requests
from datetime import datetime
import json
import zipfile
from pathlib import Path
import logging
from shutil import unpack_archive
import glob

# ---------------------------------------------------------
# ABOUT
# ---------------------------------------------------------
__author__ = "Ordnance Survey"
__created__ = "16/12/2020"
__updated__ = ""
__version__ = "1.0"
# ---------------------------------------------------------

# ---------------------------------------------------------
# VARIABLES
# ---------------------------------------------------------

# Path to script and spreadsheet location (recommended to be placed in same location as your data directory)
realPath = os.path.dirname(os.path.realpath(__file__))
productLst = 'Products.csv'
plLoc = os.path.join(realPath, productLst)

# Products API
productsAPI = 'https://api.os.uk/downloads/v1/products'

############################################################
# STEP 1 - DATAFRAME'S 
############################################################

# Read in Products.csv
dfUser = pd.read_csv(plLoc, header=0, encoding ='latin1')
print (">> Products.csv has been loaded")

# Check status of Products API URL
try: 
    checkService = requests.get(productsAPI,timeout=3) 
    checkService.raise_for_status() # Raise error in case of failure 
    if checkService.status_code == 200:
        print("API Status: Successful Connection")
except requests.exceptions.HTTPError as httpErr: 
    print ("HTTP Error:",httpErr) 
except requests.exceptions.ConnectionError as connErr: 
    print ("Error Connecting:",connErr) 
except requests.exceptions.Timeout as timeOutErr: 
    print ("Timeout Error:",timeOutErr) 
except requests.exceptions.RequestException as reqErr: 
    print ("Error:",reqErr) 

# Read in Product API information
dfProducts = pd.read_json(productsAPI)
print (">> Products API information has been collected")

# Join dataframes on id column and convert date fields for comparison analysis
dfMerge = pd.merge(dfUser, dfProducts, on='id')
pd.to_datetime(dfMerge['user_version'])
pd.to_datetime(dfMerge['version'])

############################################################
# STEP 2 - DOWNLOAD DATA 
############################################################

for index,row in dfMerge.iterrows(): # Iterate over dataframe rows
    if row['version'] > row['user_version']: # If the Product API date is greater than the users current version then an update is available
        print (">> Update available for {}. Currently downloading...".format(row['name']))
        # Variable
        dataFormat = row['user_format'] 
        # Create directory for download (if it doesn't already exist)        
        saveArea = os.path.join(realPath,row['id']) 
        check = os.path.isdir(saveArea)
        if check == False: 
            os.mkdir(saveArea)
        # Get product download URL
        r1 = requests.get(row['url']).json() 
        apiDownload = r1['downloadsUrl'] 
        # Create list for specified areas 
        userArea = row['user_area']
        areaID = userArea.split(",") 
        # Start of download process:
        for area in areaID: # Loop over area list e.g. GB or HP,HT etc 
            r2 = requests.get(apiDownload+"?format="+dataFormat+"&area="+area).json() # Obtain list of available files to download (fileName) and loop through (note: some datasets can have multiple files to download per area)
            for req2 in r2:
                with open (saveArea+"\\"+req2['fileName'], 'wb') as fd: # Using fileName captures the file extension e.g. csv, zip, mbtiles etc
                    download = requests.get(req2['url'], stream=True, verify=False )
                    for chunk in download.iter_content(chunk_size=128):
                        fd.write(chunk)
            print (">> {} has downloaded.".format(area))   
        print (">> Download complete for {}.". format(row['name']))
        row.at['user_version'] = row['version'] # Update the user_version column with the latest dates
    else:
        print (">> No updates available for {}, you have the latest version.".format(row['name']))

# Export dataframe to csv
dfMerge.to_csv(plLoc, index=False, columns =["id", "user_version", "user_format", "user_area"], encoding ='latin1' )

############################################################
# STEP 3 - Unzip and Delete
############################################################

zip_files = Path(realPath).rglob("*.zip")
while True:
    try:
        Path = next(zip_files)
    except StopIteration:
        break # no more files
    except PermissionError:
        logging.exception ("Permission error")
    else:
        extract_dir = Path.with_name(Path.stem)
        unpack_archive(str(Path),str(extract_dir), 'zip')
        os.remove(Path)
        
print (">> You are up-to-date.  All downloads and data extraction are now complete.")

############################################################
# END OF SCRIPT
############################################################