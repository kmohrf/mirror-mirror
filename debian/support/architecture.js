#!/usr/bin/env node

console.log({
  'x64': 'amd64',
  'i386': 'i386',
  'i486': 'i386',
  'i586': 'i386',
  'i686': 'i386',
  'arm': 'armel',
  'armhf': 'armhf'
}[process.arch])
