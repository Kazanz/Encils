// Will have to add this to css later
const gradientBackground = {
  //background: '#F7971E',
  //background: '-webkit-linear-gradient(to right, #FFD200, #F7971E)',
  background: 'linear-gradient(to right, #ffffff, #2196f3)'
}
const onDesktop = () => window.matchMedia(`(min-width: 1224px)`).matches;
const requestLimit = 600;
const gutterPadding = {paddingLeft: 100, paddingRight: 100};

export {
  gradientBackground,
  onDesktop,
  requestLimit,
  gutterPadding,
}
