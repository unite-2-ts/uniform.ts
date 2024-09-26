/*
 * Any message will contains:
 * {
 *   "@ID": "@UUIDv4",
 *   "@type": ["request"|"response"],
 *   "@cmd": ["access", "get", "set", "call", "construct", "deleteProperty", "has"]
 *   "@payload": [...'@payloadType'],
 *   "@result": '@payloadType' // will resolved into any promise
 * }
 */

/*
 * About any payload types...
 * "@payloadType" is:
 * - Array of [..."@payloadType"]
 * - Numbers
 * - Booleans
 * - Strings
 * - Null|NaN
 * - ["@meta"|"@data"] encoded
 * - Primitive objects of {..."@payloadType"}
 */