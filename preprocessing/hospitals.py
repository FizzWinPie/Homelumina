import numpy as np
import pandas as pd

hospitals_url = "/Users/xhonisuli/Desktop/Dataset/zillowApp/hospitals.csv"

columns = [
  "OBJECTID",
  "ZIP",
  "LATITUDE",
  "LONGITUDE",
  "BEDS",
  "TRAUMA",
  "HELIPAD",
]

hospitals_pd = pd.read_csv(hospitals_url)
hospitals_pd.columns = hospitals_pd.columns.str.strip()

hospitals_pd = hospitals_pd[columns]  # keep only relevant columns, drop the rest

### DATA ANALYSIS
print(hospitals_pd.describe())
print(hospitals_pd.dtypes)
print(f"Column with missing values: {hospitals_pd.columns[hospitals_pd.isna().any()]}")
print(f"Number of duplicate OBJECTID rows: {hospitals_pd.duplicated(subset=["OBJECTID"]).sum()}")

# invalid placeholders
invalid_placeholders = {"?", "na", "n/a", "null", "-", "none", "", "nan", "not available", "unknown"}
placeholders = [np.nan]
for col in hospitals_pd.select_dtypes(include="object"):
  for val in hospitals_pd[col].unique():
    if isinstance(val, str) and val.strip().lower() in invalid_placeholders:
      placeholders.append(val)

placeholders = list(set(placeholders))  # unique placeholders
print(f"Unique placeholders: {placeholders}")
missing = hospitals_pd.isin(placeholders)  # rows with placeholders
print(f"Total values with placeholders: {missing.sum().sort_values(ascending=False)}")

# Rows with at least one missing value
row_missing_count = missing.any(axis=1).sum()
row_missing_frac = row_missing_count / len(hospitals_pd)
print(f"Number of rows with missing values: {row_missing_count}")
print(f"Fraction of rows with missing values: {row_missing_frac}")

print(f"Dataset size: {(hospitals_pd.memory_usage(deep=True).sum() / 1e6):.2f} MB")


### DATA PROCESSING

hospitals_pd.replace(to_replace=list(placeholders), value=np.nan, inplace=True) # put null at TraumaLevel and Helipad

valid_zipcodes_pd = pd.read_csv("preprocessing/clean_csv_files/clean_zipcode.csv")
valid_zipcodes = set(valid_zipcodes_pd["ZipCode"].astype(str).str.zfill(5))

formatted_hospitals = []

for _, row in hospitals_pd.iterrows():
  # get object id - no fear of duplicates since we checked before 
  Id = row.get("OBJECTID")

  # get and format the zipcode
  raw_zipcode = int(row.get("ZIP"))
  zipcode = (str(raw_zipcode).strip().split("-")[0]).zfill(5)
  
  if (zipcode not in valid_zipcodes):
    continue

  # get location latitude
  Latitude = row.get("LATITUDE")
  if pd.isna(Latitude):
    Latitude = np.nan
  
  # get location longitude
  Longitude = row.get("LONGITUDE")
  if pd.isna(Longitude):
    Longitude = np.nan

  # number of beds
  NumberOfBeds = row.get("BEDS")
  if pd.isna(NumberOfBeds) or NumberOfBeds < 0:
    NumberOfBeds = 0

  # trauma level such as int 1, 2, 3, null
  raw_trauma = row.get("TRAUMA")
  if isinstance(raw_trauma, str) and raw_trauma.upper().startswith("LEVEL"):
    try:
        TraumaLevel = raw_trauma.upper().split("LEVEL ")[1].strip()
        if (TraumaLevel == "III"):
          TraumaLevel = 3
        elif (TraumaLevel == "II"):
          TraumaLevel = 2
        elif (TraumaLevel == "I"):
          TraumaLevel = 1
        else:
          TraumaLevel = np.nan
    except:
        TraumaLevel = np.nan
  else:
    TraumaLevel = np.nan

  # helipad as true, false, null
  raw_helipad = row.get("HELIPAD")
  if isinstance(raw_helipad, str):
    raw_helipad.upper()
    if (raw_helipad == "Y"):
      Helipad = True
    elif (raw_helipad == "N"):
      Helipad = False
    else:
      Helipad = np.nan
  else:
    Helipad = np.nan

  formatted_hospitals.append({
    "Id": Id,
    "ZipCode": zipcode,
    "Longitude": Longitude,
    "Latitude": Latitude,
    "NumberOfBeds": NumberOfBeds,
    "TraumaLevel": TraumaLevel,
    "HasHelipad": Helipad,
  })

formatted_hospitals_df = pd.DataFrame(formatted_hospitals)
print(formatted_hospitals_df.head())
print(f"Total entries: {len(formatted_hospitals_df)}")
print(formatted_hospitals_df.describe())
print(formatted_hospitals_df[formatted_hospitals_df['ZipCode'].isna()])
print(formatted_hospitals_df[formatted_hospitals_df['Id'].isna()])
print(formatted_hospitals_df[formatted_hospitals_df['Longitude'].isna()])
print(formatted_hospitals_df[formatted_hospitals_df['Latitude'].isna()])
print(formatted_hospitals_df[formatted_hospitals_df['NumberOfBeds'].isna()])
### below can be null
# print(formatted_hospitals_df[formatted_hospitals_df['TraumaLevel'].isna()])
# print(formatted_hospitals_df[formatted_hospitals_df['HasHelipad'].isna()])


formatted_hospitals_df.to_csv("preprocessing/clean_csv_files/clean_hospital.csv", index=False)