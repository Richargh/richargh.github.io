---
layout: post
title: JUnit 5 Custom Report
---

Canonical way to do it is to inject `ExtensionContext into the test and call publishReportEntry​(key, value)`

Sven fragen?

https://github.com/junit-team/junit5/blob/master/documentation/src/test/java/org/junit/api/tools/ApiReportGenerator.java

https://junit.org/junit5/docs/current/user-guide/#launcher-api-listeners-reporting

[Allure](https://docs.qameta.io/allure/#_features_3) seems to do everything we need from a custom report? and here is a [maven example](https://github.com/allure-examples/allure-junit5-example).

Here is the [JUnit5 BDD Extension](https://www.infoq.com/articles/deep-dive-junit5-extensions/).

Use the [TestExecutionListener](https://www.swtestacademy.com/reporting-test-results-tesults-junit5-jupiter/)

[JUnit5 Lifecycle and programming model](https://www.youtube.com/watch?v=-mIrA5cVfZ4)

TestReporter is there so you can publish stuff to IntelliJ Report and it looks like a console.out but it does not have the concurrency issues.


> In addition to the public Launcher API method for registering [test execution listeners](https://junit.org/junit5/docs/current/user-guide/#launcher-api-listeners-custom) programmatically, by default custom TestExecutionListener implementations will be discovered at runtime via Java’s java.util.ServiceLoader mechanism and automatically registered with the Launcher created via the LauncherFactory. For example, an example.TestInfoPrinter class implementing TestExecutionListener and declared within the /META-INF/services/org.junit.platform.launcher.TestExecutionListener file is loaded and registered automatically.
--> the launcher is part of the platform api




and surefire also has configuration parameters:

```
            <configuration>
                <properties>
                    <configurationParameters>
                        junit.jupiter.conditions.deactivate = *
                        junit.jupiter.extensions.autodetection.enabled = true
                        junit.jupiter.testinstance.lifecycle.default = per_class
                        junit.jupiter.execution.parallel.enabled = true
                    </configurationParameters>
                </properties>
            </configuration>
```


Surefire provides [custom listeners](http://maven.apache.org/surefire/maven-surefire-plugin/examples/testng.html#Using_Custom_Listeners_and_Reporters) that are configured like `<value>com.mycompany.MyResultListener` and used by JUnit4, TestNG or this example for [allure](https://github.com/allure-examples/allure-junit-example)
```
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-surefire-plugin</artifactId>
  <version>${surefire.version}</version>
  <configuration>
    <argLine>
      -javaagent:${settings.localRepository}/org/aspectj/aspectjweaver/${aspectj.version}/aspectjweaver-${aspectj.version}.jar
    </argLine>
    <properties>
      <property>
        <name>listener</name></span>
        <value>io.qameta.allure.junit4.AllureJunit4</value>
      </property>
    </properties>
  </configuration>
    <dependencies>
    <dependency>
      <groupId>org.aspectj</groupId>
      <artifactId>aspectjweaver</artifactId>
      <version>${aspectj.version}</version>
    </dependency>
  </dependencies>
</plugin>

```


Extensions are instantiated once, globally. To store data for a specific test you can use the Store abstraction.

junit has in resources junit-platform.properties. 

Since Java5 you can then use the service loader `ServiceLoader.load(Account.class)`. It's specified in resources/MEAT-INF.services/org.junit.jupiter.api.extension.Extension via which you can register extensions globally.

Design: 
* and somehow link Feature to Stories to ... 
* Even better would be if the user can create his own hierarchie of story/feature/... and custom types to fit his needs and coding language.
* Also the test report details should be modifyable by the test code as well and provide Plugins for that.
```
@Test
@Story("...")
void testSomething(BDDStuff b){
	DataBundle state = b.given("I have done foo", ::createData);

	ResultBundle actual = b.when("I do fooo", ::doFoo);

	Actual ac = ...;
	b.then("Something, somethin", assertThat(ac).is...);
}

DataBundle createData(....){
	...
}

```

> `The ConsoleLauncher` is a command-line Java application that lets you launch the JUnit Platform from the console. 

> Extensions can be registered declaratively via `@ExtendWith`, programmatically via `@RegisterExtension`, or automatically via Java’s `ServiceLoader` mechanism.
> Specifically, a custom extension can be registered by supplying its fully qualified class name in a file named org.junit.jupiter.api.extension.Extension within the /META-INF/services folder in its enclosing JAR file. To enable this feature, simply set the junit.jupiter.extensions.autodetection.enabled configuration parameter to true


> TestWatcher defines the API for extensions that wish to process the results of test method executions. Specifically, a TestWatcher will be invoked with contextual information for the following events.




Junit5 Dynamic tests via:
 ```
@TestFactory
    Collection<DynamicTest> dynamicTestsFromCollection() {
        return Arrays.asList(
            dynamicTest("1st dynamic test", () -> assertTrue(true)),
            dynamicTest("2nd dynamic test", () -> assertEquals(4, 2 * 2))
        );
    }
 ```

 JUnit Maven [Configuration Parameters](https://junit.org/junit5/docs/current/user-guide/#running-tests-build-maven-config-params):

 ```
 <plugin>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>2.22.0</version>
            <configuration>
                <properties>
                    <configurationParameters>
                        junit.jupiter.conditions.deactivate = *
                        junit.jupiter.extensions.autodetection.enabled = true
                        junit.jupiter.testinstance.lifecycle.default = per_class
                    </configurationParameters>
                </properties>
            </configuration>
        </plugin>
 ```