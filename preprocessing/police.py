import numpy as np
import pandas as pd

police_url = '/Users/xhonisuli/Desktop/Dataset/zillowApp/police stations.csv'

columns = [
    "OBJECTID",
    "ZIP",
    "LATITUDE",
    "LONGITUDE",
    "FTSWORN",
    "PTSWORN",
]

police_pd = pd.read_csv(police_url)
police_pd.columns = police_pd.columns.str.strip() # clean column names

police_pd = police_pd[columns]  # keep only relevant columns, drop the rest

### DATA ANALYSIS
print(police_pd.describe())
print(police_pd.dtypes)
print(f"Column with missing values: {police_pd.columns[police_pd.isna().any()]}")
print(f"Number of duplicate OBJECTID rows: {police_pd.duplicated(subset=["OBJECTID"]).sum()}")

# invalid placeholders
invalid_placeholders = {"?", "na", "n/a", "null", "-", "none", "", "nan", "not available", "unknown"}
placeholders = [np.nan]
for col in police_pd.select_dtypes(include="object"):
  for val in police_pd[col].unique():
    if isinstance(val, str) and val.strip().lower() in invalid_placeholders:
      placeholders.append(val)

placeholders = list(set(placeholders))  # unique placeholders
print(f"Unique placeholders: {placeholders}")
missing = police_pd.isin(placeholders)  # rows with placeholders
print(f"Total values with placeholders: {missing.sum().sort_values(ascending=False)}")

# Rows with at least one missing value
row_missing_count = missing.any(axis=1).sum()
row_missing_frac = row_missing_count / len(police_pd)
print(f"Number of rows with missing values: {row_missing_count}")
print(f"Fraction of rows with missing values: {row_missing_frac}")

print(f"Dataset size: {(police_pd.memory_usage(deep=True).sum() / 1e6):.2f} MB")


### DATA PROCESSING

valid_zipcodes_pd = pd.read_csv("preprocessing/clean_csv_files/clean_zipcode.csv")
valid_zipcodes = set(valid_zipcodes_pd["ZipCode"].astype(str).str.zfill(5))

formatted_police = []

for _, row in police_pd.iterrows():
  # get object id - no fear of duplicates since we checked before 
  Id = int(row.get("OBJECTID"))

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

  # get number of active officers
  PartTimeOfficers = row.get("PTSWORN")
  if pd.isna(PartTimeOfficers) or PartTimeOfficers < 0:
    PartTimeOfficers = 0
  
  FullTimeOfficers = row.get("FTSWORN")
  if pd.isna(FullTimeOfficers) or FullTimeOfficers < 0:
    FullTimeOfficers = 0

  TotalActiveOfficers = FullTimeOfficers + PartTimeOfficers

  formatted_police.append({
    "Id": Id,
    "ZipCode": zipcode,
    "Longitude": Longitude,
    "Latitude": Latitude,
    "FullTimeOfficers": FullTimeOfficers,
    "PartTimeOfficers": PartTimeOfficers,
    "TotalActiveOfficers": TotalActiveOfficers,
  })

formatted_police_df = pd.DataFrame(formatted_police)
print(formatted_police_df.head())
print(f"Total entries: {len(formatted_police_df)}")

print(formatted_police_df.describe())
print(formatted_police_df[formatted_police_df['ZipCode'].isna()])
print(formatted_police_df[formatted_police_df['Id'].isna()])
print(formatted_police_df[formatted_police_df['Longitude'].isna()])
print(formatted_police_df[formatted_police_df['Latitude'].isna()])
print(formatted_police_df[formatted_police_df['FullTimeOfficers'].isna()])
print(formatted_police_df[formatted_police_df['PartTimeOfficers'].isna()])
print(formatted_police_df[formatted_police_df['TotalActiveOfficers'].isna()])

formatted_police_df.to_csv("preprocessing/clean_csv_files/clean_police.csv", index=False)