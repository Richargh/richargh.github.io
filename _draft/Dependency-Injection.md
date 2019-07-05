Dependency Injection

> https://sites.google.com/site/unclebobconsultingllc/blogs-by-robert-martin/dependency-injection-inversion
> But Uncle Bob, That means I have to use new or factories, or pass globals around.
> You think the injector is not a global? You think BillingService.class is not a global? There will always be globals to deal with. You can’t write systems without them. You just need to manage them nicely.
> Guice is just a big factory.
>  Dependency Injection is just a special case of Dependency Inversion.
> Externalized dependency injection of the kind that Guice provides is appropriate for those classes that you know will be **extension points** for your system.

> https://blog.cleancoder.com/uncle-bob/2014/05/14/TheLittleMocker.html
> I don't often write mocks
> Because stubs and spies are very easy to write. My IDE makes it trivial. I just point at the interface and tell the IDE to implement it. 

> https://www.martinfowler.com/articles/injection.html