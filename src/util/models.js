export function getOrCreate (Model, id) {
  const realId = parseInt(id, 10)

  if (isNaN(realId) && id === 'new') {
    return Model.build()
  } else {
    return Model.findById(realId)
  }
}
