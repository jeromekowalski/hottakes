const Sauce = require('../models/Sauces');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
      ...sauceObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  sauce.save()
  .then(() => { res.status(201).json({message: 'Sauce enregistré !'})})
  .catch(error => { res.status(400).json( { error })})
};

exports.modifySauces = (req, res, next) => {
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`} : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({ message : 'Not authorized'});
          } else {
              Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Sauce modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {res.status(400).json({ error });});
};


exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id})
  .then(sauce => {
      if (sauce.userId != req.auth.userId) {
          res.status(401).json({message: 'Not authorized'});
      } else {
          const filename = sauce.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
              Sauce.deleteOne({_id: req.params.id})
                  .then(() => { res.status(200).json({message: 'Sauce supprimé !'})})
                  .catch(error => res.status(401).json({ error }));
          });
      }
  })
  .catch( error => {res.status(500).json({ error });});
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
    .then((sauces) => {res.status(200).json(sauces);})
    .catch((error) => {res.status(401).json({error: error});});
};  

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {res.status(200).json(sauces);})
    .catch((error) => {res.status(400).json({error: error});});
};

exports.likeSauce = (req, res, next) => {
  console.log('req.body', req.body)
  const body = req.body;
  const sauceId = req.params.id;
  const userId = req.body.userId;
  const like = req.body.like;
  const dislikes = req.body.dislikes;
  const likeObject = req.body.like;
  console.log('sauceId', sauceId);
  console.log('userId', userId);
  console.log('like', like);
  console.log('dislikes', dislikes);
   console.log('likeObject', likeObject)
  const sauce = new Sauce({
    userId: req.body.userId,
    like: req.body.like,
    dislikes: req.body.dislikes
  });
 // console.log('sauce', sauce)

  //console.log('sauce', sauce.userId);

  if(req.body.like === 1){
    Sauce.updateOne({ _id: req.params.id }, {$inc: { likes: 1},  $push: { usersLiked: req.body.userId }})
    .then(() => {
        res.status(200).json({message: 'like ajouté !'});
    })
    .catch((error) => {res.status(400).json({error: error});});
  } 

  else if(req.body.like === -1) {
    Sauce.updateOne({ _id: req.params.id }, {$inc: { dislikes: 1},  $push: { usersDisliked: req.body.userId }})
    .then(() => {
        res.status(200).json({message: 'dislike ajouté !'});
    })
    .catch((error) => {res.status(400).json({error: error});});
  }
  
  else if(req.body.like === 0) {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        if (sauce.usersLiked.find(user => user === req.body.userId)) {
          Sauce.updateOne({ _id: req.params.id }, {$inc: { likes: -1},  $pull: { usersLiked: req.body.userId }})
          .then(() => {
              res.status(200).json({message: 'like retiré !'});
          })
          .catch((error) => {res.status(400).json({error: error});});
        }
        else if (sauce.usersDisliked.find(user => user === req.body.userId)) {
          Sauce.updateOne({ _id: req.params.id}, {$inc: { dislikes: -1}, $pull: { usersDisliked: req.body.usersDisliked }})
          .then(() => {
              res.status(200).json({message: 'dislike retiré !'});
          })
          .catch((error) => {res.status(400).json({error: error});});
        }
      })
      .catch((error) => {res.status(400).json({error: error});});
  }
  
};
  