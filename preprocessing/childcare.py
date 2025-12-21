import numpy as np
import pandas as pd

childcare_path = "/Users/xhonisuli/Desktop/Dataset/zillowApp/Child_Care_Centers.csv"

columns = [
    "OBJECTID",
    "ZIP",
    "LATITUDE",
    "LONGITUDE",
]

childcare_pd = pd.read_csv(childcare_path)
childcare_pd.columns = childcare_pd.columns.str.strip() # clean column names

childcare_pd = childcare_pd[columns]  # keep only relevant columns, drop the rest

### DATA ANALYSIS
print(childcare_pd.describe())
print(childcare_pd.dtypes)
print(f"Column with missing values: {childcare_pd.columns[childcare_pd.isna().any()]}")
print(f"Number of duplicate OBJECTID rows: {childcare_pd.duplicated(subset=["OBJECTID"]).sum()}")

# invalid placeholders
invalid_placeholders = {"?", "na", "n/a", "null", "-", "none", "", "nan", "not available", "unknown"}
placeholders = [np.nan]
for col in childcare_pd.select_dtypes(include="object"):
  for val in childcare_pd[col].unique():
    if isinstance(val, str) and val.strip().lower() in invalid_placeholders:
      placeholders.append(val)

placeholders = list(set(placeholders))  # unique placeholders
print(f"Unique placeholders: {placeholders}")
missing = childcare_pd.isin(placeholders)  # rows with placeholders
print(f"Total values with placeholders: {missing.sum().sort_values(ascending=False)}")

# Rows with at least one missing value
row_missing_count = missing.any(axis=1).sum()
row_missing_frac = row_missing_count / len(childcare_pd)
print(f"Number of rows with missing values: {row_missing_count}")
print(f"Fraction of rows with missing values: {row_missing_frac}")

print(f"Dataset size: {(childcare_pd.memory_usage(deep=True).sum() / 1e6):.2f} MB")


### DATA PROCESSING

valid_zipcodes_pd = pd.read_csv("preprocessing/clean_csv_files/clean_zipcode.csv")
valid_zipcodes = set(valid_zipcodes_pd["ZipCode"].astype(str).str.zfill(5))

formatted_childcare = []

for _, row in childcare_pd.iterrows():
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

  formatted_childcare.append({
    "ZipCode": zipcode,
    "Longitude": Longitude,
    "Latitude": Latitude,
  })

formatted_childcare_df = pd.DataFrame(formatted_childcare).reset_index().rename(columns={"index": "Id"})
print(formatted_childcare_df.head())
print(f"Total entries: {len(formatted_childcare_df)}")

print(formatted_childcare_df.describe())
print(formatted_childcare_df[formatted_childcare_df['ZipCode'].isna()])
print(formatted_childcare_df[formatted_childcare_df['Longitude'].isna()])
print(formatted_childcare_df[formatted_childcare_df['Latitude'].isna()])



formatted_childcare_df.to_csv("preprocessing/clean_csv_files/clean_childcare.csv", index=False)