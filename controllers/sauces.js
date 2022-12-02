const Sauce = require('../models/Sauces');
const fs = require('fs');

//function createSauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id; // supprimer l'id qui sera générer automatiquement par mongDB
  delete sauceObject._userId; // supprimer l'userId car on va utilisé celui qui vient du token d'authentification
  const sauce = new Sauce({
      ...sauceObject,
      userId: req.auth.userId,
      likes: 0,
      dislikes: 0,
      usersDisliked: [],
      usersLiked: [],
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  sauce.save()
  .then(() => { res.status(201).json({message: 'Sauce enregistré !'})})
  .catch(error => { res.status(400).json( { error })})
};

//function modifySauces
exports.modifySauces = (req, res, next) => {
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`} : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
          if (sauce.userId != req.auth.userId) { // si l'userId est different que celui de notre token
              res.status(403).json({ message : 'unauthorized request'});
          } else {
              Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Sauce modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {res.status(400).json({ error });});
};

//function deleteSauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id})
  .then(sauce => {
      if (sauce.userId != req.auth.userId) {
        res.status(403).json({ message : 'unauthorized request'});
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

//function getOneSauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
    .then((sauces) => {res.status(200).json(sauces);})
    .catch((error) => {res.status(401).json({error: error});});
};  


//function getAllSauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {res.status(200).json(sauces);})
    .catch((error) => {res.status(400).json({error: error});});
};


//function likeSauce
exports.likeSauce = (req, res, next) => {
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
          Sauce.updateOne({ _id: req.params.id}, {$inc: { dislikes: -1}, $pull: { usersDisliked: req.body.userId }})
          .then(() => {
              res.status(200).json({message: 'dislike retiré !'});
          })
          .catch((error) => {res.status(400).json({error: error});});
        }
      })
      .catch((error) => {res.status(400).json({error: error});});
  }
};
  