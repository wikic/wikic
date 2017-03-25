#! /usr/bin/env node

const Wikic = require('./../index')

const wiki = new Wikic()

wiki.render()
wiki.watch()
wiki.serve()
