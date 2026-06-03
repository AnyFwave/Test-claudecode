export class DamageType {
  constructor({ typeId, typeName, parentType = null, onHit = null, onKill = null, modifiers = {} }) {
    this.typeId = typeId;
    this.typeName = typeName;
    this.parentType = parentType;
    this.onHit = onHit;
    this.onKill = onKill;
    this.modifiers = modifiers;
  }

  isType(typeId) {
    if (this.typeId === typeId) return true;
    if (this.parentType) return this.parentType.isType(typeId);
    return false;
  }

  getHierarchy() {
    const chain = [this.typeId];
    let current = this.parentType;
    while (current) {
      chain.push(current.typeId);
      current = current.parentType;
    }
    return chain;
  }
}
