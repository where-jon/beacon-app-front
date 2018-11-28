#! /bin/sh

for f in `find . -name '*.vue'`
do
  sed 's/getButtonTheme(this.$store.state.loginId)/getButtonTheme()/g' $f > $f.$$
  mv $f.$$ $f
done
