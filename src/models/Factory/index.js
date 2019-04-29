import mongoose from 'mongoose';

const factorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: v => /^[a-zA-Z0-9 -]+$/.test(v),
      message: props => `${props.value} is not a valid name!`
    },
  },
  lowerBound: {
    type: Number,
    min: Number.MIN_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER,
    required: true,
  },
  upperBound: {
    type: Number,
    min: Number.MIN_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER,
    required: true,
  },
  itemCount: {
    type: Number,
    min: 1,
    max: 15,
    required: true,
  },
  nodes: [{
    type: Number,
  }],
}, {
  timestamps: {
    createdAt: 'created_at'
  }
});

const Factory = new mongoose.model('Fatory', factorySchema);

const getAllFactories = async () => await Factory.find({});

const isInteger = num => !isNaN(parseInt(num)) && isFinite(num);
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const createFactory = ({ name, lowerBound, upperBound, itemCount }) => {
  //These checks are probably extra defensive since it's protected at the schema level
  if (!/^[a-zA-Z0-9 -]+$/.test(name)) {
    throw new Error('Invalid characters for name');
  }

  if (!isInteger(lowerBound)) {
    throw new Error('lowerBound must be a number');
  }

  if (!isInteger(upperBound)) {
    throw new Error('lowerBound must be a number');
  }

  if (!isInteger(itemCount)) {
    throw new Error('lowerBound must be a number');
  }

  lowerBound = parseInt(lowerBound);
  upperBound = parseInt(upperBound);
  itemCount = parseInt(itemCount);

  if (upperBound < lowerBound) {
    throw new Error('upperBound must be greater than lower bound');
  }

  const nodes = new Array(itemCount).fill(null).map(() => randomInt(lowerBound, upperBound));

  return Factory.create({ name, lowerBound, upperBound, itemCount, nodes });
};

const updateFactory = async ({ _id, change }) => {
  const { name, lowerBound, upperBound } = change;

  //These checks are probably extra defensive since it's protected at the schema level
  if (name && !/^[a-zA-Z0-9 -]+$/.test(name)) {
    throw new Error('Invalid characters for name');
  }

  if (lowerBound && !isInteger(lowerBound)) {
    throw new Error('lowerBound must be a number');
  }

  if (upperBound && !isInteger(upperBound)) {
    throw new Error('lowerBound must be a number');
  }

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    throw new Error('Invalid object id');
  }

  //get the factories item count and boundries from the db
  //one final validation
  //generate new nodes with the new boundries
  const { itemCount, lowerBound: lb, upperBound: ub } = await Factory.findOne({ _id });
  if ((lowerBound || lb) > (upperBound || ub)) {
    throw new Error('upperBound must be greater than lower bound');
  }
  const nodes = new Array(itemCount).fill(null).map(() => randomInt(parseInt(lowerBound) || lb, parseInt(upperBound) || ub));

  return Factory.updateOne({ _id }, { $set: { ...change, nodes } });
};

const deleteFactory = ({ _id }) => {
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    throw new Error('Invalid object id');
  }

  return Factory.deleteOne({ _id });
};

export default {
  createFactory,
  deleteFactory,
  getAllFactories,
  updateFactory
};