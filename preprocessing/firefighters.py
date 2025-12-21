import numpy as np
import pandas as pd

firefighters_url = "/Users/xhonisuli/Desktop/Dataset/zillowApp/firefighter stations.csv"

columns = [
  "HQ zip",
  "Number Of Stations",
  "Active Firefighters - Career",
  "Active Firefighters - Paid per Call",
  "Active Firefighters - Volunteer",
]

firefighters_pd = pd.read_csv(firefighters_url)
firefighters_pd.columns = firefighters_pd.columns.str.strip()

firefighters_pd = firefighters_pd[columns]  # keep only relevant columns, drop the rest

### DATA ANALYSIS
print(firefighters_pd.describe())
print(firefighters_pd.dtypes)
print(f"Column with missing values: {firefighters_pd.columns[firefighters_pd.isna().any()]}")
print(f"Number of duplicate HQ zip rows: {firefighters_pd.duplicated(subset=["HQ zip"]).sum()}")

# invalid placeholders
invalid_placeholders = {"?", "na", "n/a", "null", "-", "none", "", "nan", "not available", "unknown"}
placeholders = [np.nan]
for col in firefighters_pd.select_dtypes(include="object"):
  for val in firefighters_pd[col].unique():
    if isinstance(val, str) and val.strip().lower() in invalid_placeholders:
      placeholders.append(val)

placeholders = list(set(placeholders))  # unique placeholders
print(f"Unique placeholders: {placeholders}")
missing = firefighters_pd.isin(placeholders)  # rows with placeholders
print(f"Total values with placeholders: {missing.sum().sort_values(ascending=False)}")

# Rows with at least one missing value
row_missing_count = missing.any(axis=1).sum()
row_missing_frac = row_missing_count / len(firefighters_pd)
print(f"Number of rows with missing values: {row_missing_count}")
print(f"Fraction of rows with missing values: {row_missing_frac}")

print(f"Dataset size: {(firefighters_pd.memory_usage(deep=True).sum() / 1e6):.2f} MB")


### DATA PROCESSING

valid_zipcodes_pd = pd.read_csv("preprocessing/clean_csv_files/clean_zipcode.csv")
valid_zipcodes = set(valid_zipcodes_pd["ZipCode"].astype(str).str.zfill(5))

formatted_firefighter = []

for _, row in firefighters_pd.iterrows():
  # get and format the zipcode
  raw_zipcode = row.get("HQ zip")
  zipcode = (str(raw_zipcode).strip().split("-")[0]).zfill(5)
  
  if (zipcode not in valid_zipcodes):
    continue

  # number of stations
  NumberOfStations = row.get("Number Of Stations")
  if pd.isna(NumberOfStations) or NumberOfStations < 0:
    NumberOfStations = 0

  # number of active firefighters
  AF_C = row.get("Active Firefighters - Career")
  if pd.isna(AF_C) or AF_C < 0:
    AF_C = 0

  AF_V = row.get("Active Firefighters - Volunteer")
  if pd.isna(AF_V) or AF_V < 0:
    AF_V = 0

  AF_PPC = row.get("Active Firefighters - Paid per Call")
  if pd.isna(AF_PPC) or AF_PPC < 0:
    AF_PPC = 0

  ActivePersonnel = AF_C + AF_V + AF_PPC

  formatted_firefighter.append({
      "ZipCode": zipcode,
      "NumberOfStations": NumberOfStations,
      "ActivePersonnel": ActivePersonnel,
  })

formatted_firefighter_df = pd.DataFrame(formatted_firefighter).reset_index().rename(columns={"index": "DeptId"})
print(formatted_firefighter_df.head())
print(f"Total entries: {len(formatted_firefighter_df)}")
print(formatted_firefighter_df.describe())
print(formatted_firefighter_df[formatted_firefighter_df['ZipCode'].isna()])
print(formatted_firefighter_df[formatted_firefighter_df['NumberOfStations'].isna()])
print(formatted_firefighter_df[formatted_firefighter_df['ActivePersonnel'].isna()])

formatted_firefighter_df.to_csv("preprocessing/clean_csv_files/clean_firefighter.csv", index=False)