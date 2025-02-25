const { ControllerWrapper } = require("../utils/ControllerWrapper");
const authServices = require("../services/authServices");
const { HttpError } = require("../middlewares/httpError");

const path = require("path");
const fs = require("fs/promises");

const { sizePicture } = require("../utils//sizePicture");

const singup = async (req, res) => {
  const user = await authServices.singup(req.body);

  res.status(201).json({
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const singin = async (req, res) => {
  const { token, user } = await authServices.singin(req.body);

  res.status(200).json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const logout = async (req, res) => {
  await authServices.logout(req.user._id);

  res.status(204).json({ message: "Logout success" });
};

const current = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

const findUsersStatusFavorite = async (req, res) => {
  const { favorite } = req.query;
  const findContacts = await authServices.findUsersStatusFavorite(favorite);

  res.status(200).json({ findContacts });
};

const updateUserSubscription = async (req, res) => {
  const subscriptionArray = ["starter", "pro", "business"];
  const { _id } = req.user;
  const { subscription } = req.body;
  const test = subscriptionArray.includes(subscription);
  if (!test)
    throw HttpError(
      400,
      `Unfortunately, there is no such package. Choose one from ${subscriptionArray}`
    );

  const updateUser = await authServices.updateUserSubscription(
    _id,
    subscription
  );

  res.status(200).json(updateUser);
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: oldPathAvatar, filename } = req.file;
  await sizePicture(oldPathAvatar, filename);
  await fs.unlink(oldPathAvatar);
  const pathAvatar = path.join("avatars", filename);
  const { avatarURL } = await authServices.updateAvatar(_id, pathAvatar);

  res.json({
    avatarURL,
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;

  await authServices.verifyUser(verificationToken);

  res.json({ message: "Verification successful" });
};

const resendVerify = async (req, res) => {
  const { email } = req.body;

  await authServices.resendVerifyEmail(email);

  res.json({ message: "Verification email sent" });
};

module.exports = {
  singup: ControllerWrapper(singup),
  singin: ControllerWrapper(singin),
  logout: ControllerWrapper(logout),
  current: ControllerWrapper(current),
  findUsersStatusFavorite: ControllerWrapper(findUsersStatusFavorite),
  updateUserSubscription: ControllerWrapper(updateUserSubscription),
  updateAvatar: ControllerWrapper(updateAvatar),
  verify: ControllerWrapper(verify),
  resendVerify: ControllerWrapper(resendVerify),
};
