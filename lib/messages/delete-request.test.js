'use strict'

const tap = require('tap')
const { BerReader, BerWriter } = require('@ldapjs/asn1')
const DeleteRequest = require('./delete-request')

tap.test('constructor', t => {
  t.test('no args', async t => {
    const req = new DeleteRequest()
    t.strictSame(req.pojo, {
      messageId: 1,
      type: 'DeleteRequest',
      protocolOp: 0x4a,
      entry: null,
      controls: []
    })
  })

  t.test('with options', async t => {
    const req = new DeleteRequest({
      messageId: 5,
      entry: 'dc=example,dc=com'
    })
    t.strictSame(req.pojo, {
      messageId: 5,
      type: 'DeleteRequest',
      protocolOp: 0x4a,
      entry: 'dc=example,dc=com',
      controls: []
    })

    t.equal(req._dn, 'dc=example,dc=com')
    t.equal(req.entry, 'dc=example,dc=com')
    t.equal(req.type, 'DeleteRequest')
  })

  t.end()
})

tap.test('_toBer', t => {
  t.test('writes a correct sequence', async t => {
    const req = new DeleteRequest({ entry: 'foo' })
    const ber = new BerWriter()
    req._toBer(ber)

    const expected = Buffer.from([0x4a, 0x03, 0x66, 0x6f, 0x6f])
    t.equal(expected.compare(ber.buffer), 0)
  })

  t.end()
})

tap.test('_pojo', t => {
  t.test('returns implementation properties', async t => {
    const req = new DeleteRequest({ entry: 'foo' })
    t.strictSame(req._pojo(), {
      protocolOp: 0x4a,
      entry: 'foo'
    })
  })

  t.end()
})

tap.test('#parseToPojo', t => {
  t.test('throws if tag is wrong', async t => {
    const input = Buffer.from([0x4b, 0x03, 0x66, 0x6f, 0x6f])
    t.throws(
      () => DeleteRequest.parseToPojo(new BerReader(input)),
      Error('found wrong protocol operation: 0x4b')
    )
  })

  t.test('returns a pojo', async t => {
    const input = Buffer.from([0x4a, 0x03, 0x66, 0x6f, 0x6f])
    const pojo = DeleteRequest.parseToPojo(new BerReader(input))
    t.strictSame(pojo, {
      protocolOp: 0x4a,
      entry: 'foo'
    })
  })

  t.end()
})
