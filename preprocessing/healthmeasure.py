import pandas as pd
from decimal import Decimal

df = pd.read_csv(
    "CDC_PLACES__Local_Data_for_Better_Health__ZCTA_Data_2024_release_20250607.csv",
    # Zip code column must be read as string to not remove leading 0s
    converters={ "Measure": str.strip, "LocationName": str.strip }
)


# Maps columns from original CSV to the attributes for HealthMeasure table
column_mapping = {
    "Measure": "Measure",
    "LocationName": "ZipCode",
    "Data_Value": "Ratio",
    "TotalPopulation": "TotalPopulation"
}

# Filters for only the 6 health measures that we want to store in our database
target_measures = [
    "Obesity among adults",
    "Depression among adults",
    "Housing insecurity in the past 12 months among adults",
    "Feeling socially isolated among adults",
    "Current asthma among adults",
    "Visits to doctor for routine checkup within the past year among adults"
]
df_filtered = df[df["Measure"].isin(target_measures)]

# We want to confirm that all health measures that we're keeping are measured as a percentage of total population
if not (df_filtered["Data_Value_Unit"] == "%").all():
    raise ValueError("Some measures are not measured in percentage, which breaks our expectations")

# Further filters out all columns not in the column mapping (we don't need them for HealthMeasure table)
df_filtered = df_filtered[list(column_mapping.keys())]

# Renames the columns in the column mapping
df_renamed = df_filtered.rename(columns=column_mapping)

# Converts numbers like 20 to 0.2 (to represent 20%)
# NOTE: We must use Decimal library to avoid floating point precision issues
df_renamed["Ratio"] = df_renamed["Ratio"].apply(lambda x: float(Decimal(str(x)) / Decimal("100")))

df_renamed.to_csv("clean_healthmeasure.csv", index=False)
print("Created clean_healthmeasure.csv file")