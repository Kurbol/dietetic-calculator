import { convert } from '@/services/equation-processor.js'

export default {
  state() {
    return {
      type: undefined,
      from: {
        value: undefined,
        unit: undefined
      },
      to: {
        value: undefined,
        unit: undefined
      }
    }
  },
  mutations: {
    Set_Type(state, { type }) {
      state.type = type
    },
    Set_From_Value(state, { value }) {
      state.from.value = value
    },
    Set_From_Unit(state, { unit }) {
      state.from.unit = unit
    },
    Set_To_Value(state, { value }) {
      state.to.value = value
    },
    Set_To_Unit(state, { unit }) {
      state.to.unit = unit
    }
  },
  actions: {
    setType({ rootGetters, commit, dispatch }, { type }) {
      commit('Set_Type', { type })
      dispatch('setFromUnit', {
        unit: rootGetters['calcs/unitsOfType'](type)[0].symbol
      })
      dispatch('setToUnit', {
        unit: rootGetters['calcs/unitsOfType'](type)[1].symbol
      })
      dispatch('setFromValue', { value: 1 })
    },
    setFromValue({ commit, dispatch }, { value }) {
      commit('Set_From_Value', { value })
      dispatch('calculateToValue')
    },
    setFromUnit({ commit, dispatch }, { unit }) {
      commit('Set_From_Unit', { unit })
      dispatch('calculateToValue')
    },
    setToValue({ commit, dispatch }, { value }) {
      commit('Set_To_Value', { value })
      dispatch('calculateFromValue')
    },
    setToUnit({ commit, dispatch }, { unit }) {
      commit('Set_To_Unit', { unit })
      dispatch('calculateToValue')
    },
    calculateFromValue({ rootState, state, commit }) {
      const fromValue = convert({
        unitData: rootState.calcs.units,
        value: state.to.value,
        fromUnit: state.to.unit,
        toUnit: state.from.unit
      })
      commit('Set_From_Value', { value: fromValue })
    },
    calculateToValue({ rootState, state, commit }) {
      const toValue = convert({
        unitData: rootState.calcs.units,
        value: state.from.value,
        fromUnit: state.from.unit,
        toUnit: state.to.unit
      })
      commit('Set_To_Value', { value: toValue })
    }
  },
  getters: {}
}
