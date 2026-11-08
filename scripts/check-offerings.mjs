#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const resources = JSON.parse(readFileSync(resolve(root, 'src/data/resources.json'), 'utf8'))
const catalogue = JSON.parse(readFileSync(resolve(root, 'src/data/offerings.json'), 'utf8'))
const allowedTypes = new Set(['free-tier', 'trial', 'credit', 'api-demo', 'paid-usage'])
const resourceIds = new Set(resources.map((resource) => resource.id))
const seen = new Set()
const errors = []
const fail = (message) => errors.push(message)
const isDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value + 'T00:00:00Z')
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}
/*
 * Amount sanity: this catalogue's whole point is legible quota evidence, and an
 * earlier revision shipped "最高 00 AWS credits" — a "$200" that lost its
 * leading digits — past every structural check below. A bare "00" (or any run
 * of zeros not part of a larger number, a decimal, or a thousands group) is
 * never a valid amount, so it is rejected outright. "100" / "10.00" / "0.5" /
 * "1,000" stay legal.
 */
const CORRUPTED_AMOUNT = /(?:^|[^\d.,])0{2,}(?=[^\d.]|$)/
/*
 * Shell-expansion pollution: an earlier revision generated these strings
 * through a shell where "$0" expanded to "/bin/bash", shipping prose like
 * "Free /bin/bash 计划" and "$0.0015" as "/bin/bash.0015". A shell path has no
 * business inside quota prose, so it is rejected outright.
 */
const SHELL_POLLUTION = /\/(?:bin|usr|etc|var|tmp|home)\//
const collectStrings = (entry) => {
  const values = [entry.label, entry.shortLabel, entry.summary]
  for (const limit of entry.limits ?? []) values.push(...limit)
  for (const condition of entry.conditions ?? []) values.push(condition)
  for (const source of entry.sources ?? []) values.push(...source)
  return values.filter((value) => typeof value === 'string')
}

if (catalogue.schemaVersion !== 1) fail('schemaVersion must be 1')
if (!isDate(catalogue.verifiedAt)) fail('catalogue.verifiedAt must be YYYY-MM-DD')
if (!Array.isArray(catalogue.entries)) fail('entries must be an array')

for (const [index, entry] of (catalogue.entries ?? []).entries()) {
  const prefix = 'entries[' + index + ']'
  if (!entry || typeof entry !== 'object') {
    fail(prefix + ' must be an object')
    continue
  }
  if (!resourceIds.has(entry.resourceId)) fail(prefix + ': unknown resourceId "' + entry.resourceId + '"')
  if (seen.has(entry.resourceId)) fail(prefix + ': duplicate resourceId "' + entry.resourceId + '"')
  seen.add(entry.resourceId)

  for (const key of ['label', 'shortLabel', 'summary']) {
    if (typeof entry[key] !== 'string' || !entry[key].trim()) fail(prefix + '.' + key + ' must be a non-empty string')
  }
  if (!Array.isArray(entry.types) || !entry.types.length || entry.types.some((type) => !allowedTypes.has(type))) {
    fail(prefix + '.types must contain one or more known offering types')
  }
  if (!isDate(entry.verifiedAt)) fail(prefix + '.verifiedAt must be YYYY-MM-DD')
  for (const value of collectStrings(entry)) {
    if (CORRUPTED_AMOUNT.test(value)) fail(prefix + ': amount "' + value.slice(0, 60) + '" contains a bare 00 — a currency amount likely lost its leading digits')
    if (SHELL_POLLUTION.test(value)) fail(prefix + ': prose "' + value.slice(0, 60) + '" contains a filesystem path — a "$..." amount likely got shell-expanded')
  }

  if (!Array.isArray(entry.limits)) fail(prefix + '.limits must be an array')
  for (const [limitIndex, limit] of (entry.limits ?? []).entries()) {
    if (!Array.isArray(limit) || limit.length !== 3 || limit.some((value) => typeof value !== 'string' || !value.trim())) {
      fail(prefix + '.limits[' + limitIndex + '] must be [label, value, period] with non-empty strings')
    }
  }

  if (!Array.isArray(entry.conditions) || !entry.conditions.length ||
      entry.conditions.some((value) => typeof value !== 'string' || !value.trim())) {
    fail(prefix + '.conditions must contain non-empty strings')
  }
  if (!Array.isArray(entry.sources) || !entry.sources.length) fail(prefix + '.sources must contain at least one source')
  for (const [sourceIndex, source] of (entry.sources ?? []).entries()) {
    if (!Array.isArray(source) || source.length !== 3 ||
        source.some((value) => typeof value !== 'string' || !value.trim())) {
      fail(prefix + '.sources[' + sourceIndex + '] must be [label, https URL, claim]')
      continue
    }
    try {
      if (new URL(source[1]).protocol !== 'https:') fail(prefix + '.sources[' + sourceIndex + '] URL must use HTTPS')
    } catch {
      fail(prefix + '.sources[' + sourceIndex + '] URL is invalid')
    }
  }
}

if (errors.length) {
  console.error('Offering evidence validation failed:')
  for (const error of errors) console.error(' - ' + error)
  process.exitCode = 1
} else {
  console.log('Offering evidence check passed: ' + catalogue.entries.length + ' entries, ' + seen.size + ' unique resources, all source links use HTTPS.')
}
