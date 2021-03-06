import React from 'react';
import { formatPercentage, formatNumber } from 'common/format';

// dependencies
import Combatants from 'Parser/Core/Modules/Combatants';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';

class XanshiCloak extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  }

  _xanshiActive = false;
  healing = 0;
  overhealing = 0;
  absorbed = 0;
  manaSaved = 0;
  casts = [];

  on_initialized() {
    this.active = this.combatants.selected.hasBack(ITEMS.XANSHI_CLOAK.id);
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.XANSHI_CLOAK_BUFF.id) {
      return;
    }

    this._xanshiActive = false;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.XANSHI_CLOAK_BUFF.id) {
      return;
    }

    this._xanshiActive = true;
  }

  on_byPlayer_heal(event) {
    if (!this._xanshiActive) { return; }

    this.healing += event.amount || 0;
    this.overhealing += event.overheal || 0;
    this.absorbed += event.absorbed || 0;
  }

  on_byPlayer_cast(event) {
    if (!this._xanshiActive) { return; }

    this.manaSaved += event.rawManaCost || 0;
    this.casts.push(event.ability.guid);
  }

  item() {
    const cloakPercHPS = formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing));
    const cloakHPS = formatNumber(this.healing / this.owner.fightDuration * 1000);

    return {
      item: ITEMS.XANSHI_CLOAK,
      result: (
        <dfn data-tip="Value of spells cast during the cloak's buff. Does not assume all healing after cloak ends would be a result of the cloak.">
          { cloakPercHPS } % / { cloakHPS } HPS / { formatNumber(this.manaSaved) } mana saved
        </dfn>
      ),
    };
  }
}

export default XanshiCloak;
