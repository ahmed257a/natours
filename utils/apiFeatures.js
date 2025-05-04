class ApiFeatures {
  constructor(query, queryString) {
    this.queryString = queryString;
    this.query = query;
  }
  // filter() {
  //   const queryObj = { ...this.queryString };
  //   // remove excluded fields
  //   const excludedFields = ['sort', 'page', 'limit', 'fields'];
  //   excludedFields.forEach((el) => delete queryObj[el]);

  //   // add $ symbol to the filter query
  //   let queryStr = JSON.stringify(queryObj);
  //   queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  //   this.query = this.query.find(JSON.parse(queryStr));
  //   return this;
  // }
  filter() {
    // Exclude special query parameters [page, limit, sort, fields]
    let queryObj = { ...this.queryString };
    const excludedFields = ['page', 'limit', 'sort', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Prefix filter query keys with a $ symbol for MongoDB operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // Build the mongoose query
    this.query = this.query.find(JSON.parse(queryStr));

    return this; // enable chaining
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page || 1;
    const limit = this.queryString.limit || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      let fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
}

module.exports = ApiFeatures;
