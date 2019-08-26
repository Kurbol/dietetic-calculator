import CalcService from '@/services/calcs.js'

export default {
  state() {
    return {
      categories: []
    }
  },

  mutations: {
    Set_Unit_Categories(state, categories) {
      state.categories = categories
    }
  },

  actions: {
    async fetchUnits({ commit, dispatch, getters }) {
      const categories = await CalcService.getUnitCategories()
      commit('Set_Unit_Categories', categories)
      const category = getters.categoriesWithMultipleUnits[0]
      dispatch('convert/setCategory', { category }, { root: true })
    }
  },

  getters: {
    allUnits: (state) =>
      state.categories
        .map((category) => category.units)
        .reduce((acc, cur) => [...acc, ...cur]),
    categoriesWithMultipleUnits: (state) =>
      state.categories
        .filter((category) => category.units.length >= 2)
        .map((category) => category.name),
    unitsInCategory: (state) => (categoryName) =>
      state.categories.find((category) => category.name === categoryName).units,
    symbolCategory: (state) => (symbol) =>
      state.categories.find((category) =>
        category.units.map((unit) => unit.symbol).includes(symbol)
      ).name,
    unitWithSymbol: (state, getters) => (symbol) =>
      getters.allUnits.find((unit) => unit.symbol === symbol)
  }
}
