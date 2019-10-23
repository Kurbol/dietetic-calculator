import * as R from 'ramda'
import CalcService from '@/services/calcs.js'
import { equationProcessor } from '@/services/equation-processor.js'

const INVALID_INPUTS = 'Invalid Inputs'

export default {
  state() {
    return {
      categories: [],
      calculators: [],
      inputs: [],
      selects: []
    }
  },

  mutations: {
    Set_Categories(state, categories) {
      state.categories = categories
    },
    Set_Calculators(state, calculators) {
      state.calculators = calculators
    },
    Set_Inputs(state, inputs) {
      state.inputs = inputs
    },
    Set_Selects(state, selects) {
      state.selects = selects
    },
    Toggle_Activate_Category(state, name) {
      state.categories = state.categories.map((x) =>
        x.name === name ? { ...x, active: !x.active } : x
      )
    },
    Toggle_Activate_Calculator(state, key) {
      state.calculators = state.calculators.map((x) =>
        x.key === key ? { ...x, active: !x.active } : x
      )
    },
    Set_All_Categories_Active(state, active) {
      state.categories = state.categories.map((x) => ({ ...x, active }))
    },
    Set_All_Calculators_Active(state, active) {
      state.calculators = state.calculators.map((x) => ({ ...x, active }))
    },
    Set_Select_Value(state, { name, value }) {
      state.selects = state.selects.map((x) =>
        x.name === name ? { ...x, value } : x
      )
    },
    Set_Input_Value(state, { name, value }) {
      state.inputs = state.inputs.map((x) =>
        x.name === name ? { ...x, value } : x
      )
    },
    Set_Input_Selected_Unit(state, { name, selectedUnit }) {
      state.inputs = state.inputs.map((x) =>
        x.name === name ? { ...x, selectedUnit } : x
      )
    },
    Clear_Inputs(state) {
      state.inputs = state.inputs.map((x) => ({ ...x, value: undefined }))
      state.selects = state.selects.map((x) => ({
        ...x,
        value: undefined
      }))
    },
    Set_Result_Selected_Unit(state, { key, selectedUnit }) {
      state.calculators = state.calculators.map((x) =>
        x.key === key ? { ...x, selectedUnit } : x
      )
    },
    Set_Result(state, { key, result }) {
      state.calculators = state.calculators.map((x) =>
        x.key === key ? { ...x, result } : x
      )
    }
  },

  actions: {
    async fetchCategories({ commit }) {
      const data = await CalcService.getCalculatorCategories()
      const categories = data.map((category) => ({
        ...category,
        active: true
      }))
      commit('Set_Categories', categories)
    },
    async fetchCalculators({ commit }) {
      const data = await CalcService.getCalculators()
      const calculators = data.map((calc) => ({
        ...calc,
        active: false,
        result: INVALID_INPUTS,
        selectedUnit: calc.defaultUnit
      }))
      commit('Set_Calculators', calculators)
    },
    async fetchInputs({ commit }) {
      const inputData = await CalcService.getInputs()
      const inputs = inputData.map((input) => ({
        ...input,
        value: undefined,
        selectedUnit: input.defaultUnit
      }))
      commit('Set_Inputs', inputs)

      const selectData = await CalcService.getSelects()
      const selects = selectData.map((select) => ({
        ...select,
        value: undefined
      }))
      commit('Set_Selects', selects)
    },
    toggleActivateCategory({ commit }, name) {
      commit('Toggle_Activate_Category', name)
    },
    toggleActivateCalculator({ commit }, key) {
      commit('Toggle_Activate_Calculator', key)
    },
    setAllCalculatorsActive({ commit }, active) {
      commit('Set_All_Calculators_Active', active)
      if (active) {
        commit('Set_All_Categories_Active', true)
      }
    },
    setSelectValue({ commit, dispatch }, { name, value }) {
      commit('Set_Select_Value', { name, value })
      dispatch('calculateResults')
    },
    setInputValue({ commit, dispatch }, { name, value }) {
      commit('Set_Input_Value', { name, value })
      dispatch('calculateResults')
    },
    setInputSelectedUnit({ commit, dispatch }, { name, selectedUnit }) {
      commit('Set_Input_Selected_Unit', { name, selectedUnit })
      dispatch('calculateResults')
    },
    clearInputs({ commit, dispatch }) {
      commit('Clear_Inputs')
      dispatch('calculateResults')
    },
    setResultSelectedUnit({ commit, dispatch }, { key, selectedUnit }) {
      commit('Set_Result_Selected_Unit', { key, selectedUnit })
      dispatch('calculateResults')
    },
    calculateResults({ rootGetters, state, commit }) {
      const processEquation = equationProcessor({
        unitData: rootGetters['units/allUnits'],
        inputs: state.inputs,
        selects: state.selects
      })
      state.calculators.forEach((calc) => {
        const result = processEquation(calc) || INVALID_INPUTS
        const rounded = isNaN(result) ? result : parseFloat(result.toFixed(1))
        commit('Set_Result', { key: calc.key, result: rounded })
      })
    }
  },

  getters: {
    activeCalcs: (state) => state.calculators.filter((x) => x.active),
    calcsInCategory: (state) => (name) =>
      state.calculators.filter((x) => x.category.name === name),
    activeCalcsInCategory: (state, getters) => (name) =>
      getters.activeCalcs.filter((x) => x.category.name === name),
    activeCalcsWithResults: (state, getters) =>
      getters.activeCalcs.filter((x) => !isNaN(x.result)),
    activeInputs: (state, getters) =>
      R.pipe(
        R.map(R.prop('inputs')),
        R.reduce(R.union, []),
        R.innerJoin(R.eqProps('name'), state.inputs)
      )(getters.activeCalcs),
    activeSelects: (state, getters) =>
      R.pipe(
        R.map(R.prop('selects')),
        R.reduce(R.union, []),
        R.innerJoin(R.eqProps('name'), state.selects)
      )(getters.activeCalcs)
  }
}