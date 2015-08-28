var helpers = require('./helpers')
var models = helpers.models
var Answer = models.Answer
var QuestionsRepo = require('../repos/questions')

function authLogin (passport) {
  return passport.authenticate('local-login', {
    failureRedirect: '/admin/login',
    successRedirect: '/admin'
  })
}

function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) { return next() }
  return res.redirect('/admin/login')
}

function getQuestions (req, res) {
  QuestionsRepo.getQAs().then(function (questions) {
    res.render('admin/questions', {
      questions: questions
    })
  })
}

function renderLogin (req, res) {
  res.render('admin/login')
}

function createQuestion (req, res) {
  var questionTitle = req.body.questionTitle
  var questionDescription = req.body.questionDescription
  var pendingQuestion = QuestionsRepo.create({
    title: questionTitle,
    description: questionDescription
  })
  return pendingQuestion
    .then(function (question) {
      res.redirect('/admin/questions')
    })
}

function createAnswer (req, res) {
  var questionId = req.params.questionId
  var answerDescription = req.body.answerDescription
  return Answer
    .create({
      description: answerDescription,
      QuestionId: questionId
    })
    .then(function (answer) {
      res.redirect('/admin/questions')
    })
}

function getStats (req, res) {
  return QuestionsRepo.getStats().then(function (questions) {
    res.render('admin/dashboard', { questions: questions })
  })
}

module.exports = function (app, passport) {
  app.get('/admin', isLoggedIn, getStats)
  app.get('/admin/login', renderLogin)
  app.get('/admin/questions', isLoggedIn, getQuestions)
  app.post('/admin/login', authLogin(passport))
  app.post('/admin/questions/new', isLoggedIn, createQuestion)
  app.post('/admin/questions/:questionId/answers/new', isLoggedIn, createAnswer)
  app.post('/admin/questions/:questionId/delete')
}
