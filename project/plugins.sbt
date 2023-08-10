resolvers += Resolver.url(
  "lila-maven-sbt",
  url("https://raw.githubusercontent.com/ornicar/lila-maven/master")
)(Resolver.ivyStylePatterns)
addSbtPlugin("com.typesafe.play" % "sbt-plugin"         % "2.8.7-lila_1.6")
addSbtPlugin("org.scalameta"     % "sbt-scalafmt"       % "2.4.2")
addSbtPlugin("ch.epfl.scala"     % "sbt-bloop"          % "1.4.8")
addSbtPlugin("ch.epfl.scala"     % "sbt-scala3-migrate" % "0.4.2")
// sbt-dotty is not required since sbt 1.5.0-M1
addSbtPlugin("ch.epfl.lamp" % "sbt-dotty" % "0.5.3")
ThisBuild / libraryDependencySchemes ++= Seq(
  "org.scala-lang.modules" %% "scala-xml" % VersionScheme.Always
)
