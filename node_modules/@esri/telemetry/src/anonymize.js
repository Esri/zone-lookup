import Crypto from './crypto'

export default function (user) {
  if (!user) return undefined
  return Crypto.SHA256(user).toString(Crypto.enc.Hex)
}
