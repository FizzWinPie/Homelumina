/**
 * Static schema for the SQL agent (natural language to SQL).
 * Describes PostgreSQL tables and columns so the LLM can generate valid SELECT queries.
 * Keep in sync with the actual database and server/README.md Data Sources section.
 *
 * Table and column names are listed in lowercase; PostgreSQL folds unquoted identifiers to lowercase.
 */

const TABLES = [
  {
    name: 'zipcode',
    description: 'ZIP code to city/state mappings and location',
    columns: [
      { name: 'zipcode', type: 'varchar', description: 'ZIP code (e.g. 19104)' },
      { name: 'city', type: 'varchar', description: 'City name' },
      { name: 'state', type: 'varchar', description: 'State code (e.g. PA)' },
      { name: 'population', type: 'integer', description: 'Population for this ZIP' },
      { name: 'latitude', type: 'numeric', description: 'Latitude' },
      { name: 'longitude', type: 'numeric', description: 'Longitude' }
    ]
  },
  {
    name: 'city',
    description: 'City-level information and demographics',
    columns: [
      { name: 'city', type: 'varchar', description: 'City name' },
      { name: 'state', type: 'varchar', description: 'State code' }
    ]
  },
  {
    name: 'hospitals',
    description: 'Hospital facility data with locations',
    columns: [
      { name: 'id', type: 'integer', description: 'Hospital ID' },
      { name: 'zipcode', type: 'varchar', description: 'ZIP code' },
      { name: 'latitude', type: 'numeric', description: 'Latitude' },
      { name: 'longitude', type: 'numeric', description: 'Longitude' },
      { name: 'rating', type: 'numeric', description: 'Rating' }
    ]
  },
  {
    name: 'policestations',
    description: 'Police station locations and details',
    columns: [
      { name: 'id', type: 'integer', description: 'Station ID' },
      { name: 'zipcode', type: 'varchar', description: 'ZIP code' },
      { name: 'totalactiveofficers', type: 'integer', description: 'Total active officers' },
      { name: 'latitude', type: 'numeric', description: 'Latitude' },
      { name: 'longitude', type: 'numeric', description: 'Longitude' },
      { name: 'rating', type: 'numeric', description: 'Rating' }
    ]
  },
  {
    name: 'firefighterstations',
    description: 'Fire department locations',
    columns: [
      { name: 'dptid', type: 'integer', description: 'Department ID' },
      { name: 'zipcode', type: 'varchar', description: 'ZIP code' },
      { name: 'numberofstations', type: 'integer', description: 'Number of stations' },
      { name: 'activepersonnel', type: 'integer', description: 'Active personnel count' },
      { name: 'rating', type: 'numeric', description: 'Rating' }
    ]
  },
  {
    name: 'childcarecenters',
    description: 'Childcare facility information',
    columns: [
      { name: 'id', type: 'integer', description: 'Facility ID' },
      { name: 'zipcode', type: 'varchar', description: 'ZIP code' },
      { name: 'latitude', type: 'numeric', description: 'Latitude' },
      { name: 'longitude', type: 'numeric', description: 'Longitude' },
      { name: 'rating', type: 'numeric', description: 'Rating' }
    ]
  },
  {
    name: 'healthmeasure',
    description: 'Health outcome metrics (obesity, asthma, depression, etc.); ratio 0-1',
    columns: [
      { name: 'zipcode', type: 'varchar', description: 'ZIP code' },
      { name: 'measure', type: 'varchar', description: 'Measure name (e.g. obesity, asthma)' },
      { name: 'ratio', type: 'numeric', description: 'Ratio 0-1 scale' },
      { name: 'totalpopulation', type: 'integer', description: 'Population for this measure' }
    ]
  },
  {
    name: 'householdincome',
    description: 'Income data by ZIP code',
    columns: [
      { name: 'zipcode', type: 'varchar', description: 'ZIP code' },
      { name: 'meanincome', type: 'numeric', description: 'Mean household income' }
    ]
  },
  {
    name: 'localmarket',
    description: 'Real estate market data (prices, listings); monthdate is YYYYMM format',
    columns: [
      { name: 'zipcode', type: 'varchar', description: 'ZIP code' },
      { name: 'medianlistingprice', type: 'integer', description: 'Median listing price' },
      { name: 'monthdate', type: 'integer', description: 'Date as YYYYMM (e.g. 202205)' },
      { name: 'activelistingcount', type: 'integer', description: 'Active listing count' }
    ]
  },
  {
    name: 'population',
    description: 'Population by ZIP code',
    columns: [
      { name: 'zipcode', type: 'varchar', description: 'ZIP code' },
      { name: 'population', type: 'integer', description: 'Population' },
      { name: 'city', type: 'varchar', description: 'City name' },
      { name: 'state', type: 'varchar', description: 'State code' }
    ]
  },
  {
    name: 'realtor',
    description: 'Individual real estate listings',
    columns: [
      { name: 'id', type: 'integer', description: 'Listing ID' },
      { name: 'zipcode', type: 'varchar', description: 'ZIP code' },
      { name: 'price', type: 'numeric', description: 'Listing price' },
      { name: 'bedrooms', type: 'integer', description: 'Number of bedrooms' },
      { name: 'bathrooms', type: 'numeric', description: 'Number of bathrooms' },
      { name: 'sqft', type: 'integer', description: 'Square footage' },
      { name: 'property_type', type: 'varchar', description: 'Property type' },
      { name: 'address', type: 'varchar', description: 'Address' },
      { name: 'city', type: 'varchar', description: 'City' },
      { name: 'state', type: 'varchar', description: 'State' },
      { name: 'latitude', type: 'numeric', description: 'Latitude' },
      { name: 'longitude', type: 'numeric', description: 'Longitude' },
      { name: 'listing_date', type: 'date', description: 'Listing date' }
    ]
  }
];

/**
 * Returns the full schema structure (for programmatic use).
 * @returns {Array<{name: string, description: string, columns: Array<{name: string, type: string, description: string}>}>}
 */
function getSchema() {
  return TABLES;
}

/**
 * Returns a plain-text schema description for the LLM prompt.
 * Format: table name, description, and column list so the model can generate valid SQL.
 * @returns {string}
 */
function getSchemaContext() {
  return TABLES.map((t) => {
    const cols = t.columns.map((c) => `${c.name} (${c.type})`).join(', ');
    return `Table: ${t.name}\n  Description: ${t.description}\n  Columns: ${cols}`;
  }).join('\n\n');
}

module.exports = {
  TABLES,
  getSchema,
  getSchemaContext
};
