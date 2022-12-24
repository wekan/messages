'use strict'

const tap = require('tap')
const { operations } = require('@ldapjs/protocol')
const CompareRequest = require('./compare-request')

const { compareRequestBytes } = require('./_fixtures/message-byte-arrays')
const { BerReader, BerWriter } = require('@ldapjs/asn1')

tap.test('basic', t => {
  t.test('constructor no args', async t => {
    const req = new CompareRequest()
    t.strictSame(req.pojo, {
      messageId: 1,
      protocolOp: operations.LDAP_REQ_COMPARE,
      type: 'CompareRequest',
      entry: null,
      attribute: '',
      value: '',
      controls: []
    })
  })

  t.test('constructor with args', async t => {
    const req = new CompareRequest({
      entry: 'dn=foo,dc=example,dc=com',
      attribute: 'foo',
      value: 'bar'
    })
    t.strictSame(req.pojo, {
      messageId: 1,
      protocolOp: operations.LDAP_REQ_COMPARE,
      type: 'CompareRequest',
      entry: 'dn=foo,dc=example,dc=com',
      attribute: 'foo',
      value: 'bar',
      controls: []
    })
  })

  t.test('.type', async t => {
    const req = new CompareRequest()
    t.equal(req.type, 'CompareRequest')
  })

  t.test('.dn', async t => {
    const req = new CompareRequest({ entry: 'dn=foo,dc=example,dc=com' })
    t.equal(req.dn, 'dn=foo,dc=example,dc=com')
  })

  t.end()
})

tap.test('.attribute', t => {
  t.test('gets and sets', async t => {
    const req = new CompareRequest()
    t.equal(req.attribute, '')
    req.attribute = 'foo'
    t.equal(req.attribute, 'foo')
  })

  t.end()
})

tap.test('.entry', t => {
  t.test('gets and sets', async t => {
    const req = new CompareRequest()
    t.equal(req.entry, null)
    req.entry = 'foo'
    t.equal(req.entry, 'foo')
  })

  t.end()
})

tap.test('.value', t => {
  t.test('gets and sets', async t => {
    const req = new CompareRequest()
    t.equal(req.value, '')
    req.value = 'foo'
    t.equal(req.value, 'foo')
  })

  t.end()
})

tap.test('_toBer', t => {
  t.test('converts instance to BER', async t => {
    const req = new CompareRequest({
      messageId: 2,
      entry: 'uid=jdoe,ou=People,dc=example,dc=com',
      attribute: 'employeeType',
      value: 'salaried'
    })
    const writer = new BerWriter()
    req._toBer(writer)

    t.equal(
      Buffer.from(compareRequestBytes.slice(5)).compare(writer.buffer),
      0
    )
  })

  t.end()
})

tap.test('_pojo', t => {
  t.test('returns a pojo representation', async t => {
    const req = new CompareRequest({
      entry: 'foo',
      attribute: 'bar',
      value: 'baz'
    })
    t.strictSame(req._pojo(), {
      entry: 'foo',
      attribute: 'bar',
      value: 'baz'
    })
  })

  t.end()
})

tap.test('#parseToPojo', t => {
  t.test('throws if operation incorrect', async t => {
    const reqBuffer = Buffer.from(compareRequestBytes)
    reqBuffer[5] = 0x61

    const reader = new BerReader(reqBuffer)
    reader.readSequence()
    reader.readInt()

    t.throws(
      () => CompareRequest.parseToPojo(reader),
      Error('found wrong protocol operation: 0x61')
    )
  })

  t.test('returns a pojo representation', async t => {
    const reqBuffer = Buffer.from(compareRequestBytes)
    const reader = new BerReader(reqBuffer)
    reader.readSequence()
    reader.readInt()

    const pojo = CompareRequest.parseToPojo(reader)
    t.equal(pojo.protocolOp, operations.LDAP_REQ_COMPARE)
    t.equal(pojo.entry, 'uid=jdoe,ou=People,dc=example,dc=com')
    t.equal(pojo.attribute, 'employeeType')
    t.equal(pojo.value, 'salaried')
  })

  t.end()
})
