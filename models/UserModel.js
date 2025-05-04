const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'please tell us your name!'],
    },
    email: {
      type: String,
      trim: true,
      required: [true, 'please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email.'],
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // This only works on SAVE (.create(), .save())!!!
        // Won't work if used findByIdAndUpdate
        validator: function (el) {
          return el === this.password;
        },
        message: 'passwords are not the same',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// A MiddleWare to encrypt/hash the password & to delete the passwordConfirm
userSchema.pre('save', async function (next) {
  // only if newly created or modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// A middelWare to update the passwordChangedAt property
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// A query 'pre-save' middleware to hide inactive users
userSchema.pre(/^find/, function (next) {
  this.where({ active: true });
  next();
});

// An Instance method to verify if password correct during login
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// An instance method to check if user changed password after issuing the token
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  // if user  changed password it will be defined else -> undefined
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};

// An instance mehtod to generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// // Virtual child referencing - to 'populate' later
// userSchema.virtual('reviews', {
//   ref: 'Review',
//   localField: '_id',
//   foreignField: 'user',
//   justOne: false,
// });

const User = mongoose.model('User', userSchema);

module.exports = User;
