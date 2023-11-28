# Dependency Injection (DI) 
Dependency Injection в Angular - это паттерн, который позволяет внедрять зависимости в компоненты и другие объекты в приложении. Механизм, позволяющий классам просить объекты других классов, но при этом их сами не создавать. (Я хочу создать класс Foo, но не знаю как его создать, нужно ли ему что-то передавать в конструктор, какие параметры). Это важная концепция, поскольку позволяет управлять зависимостями и производить инъекции, вместо того чтобы создавать объекты напрямую внутри классов.

# Inversion of Control Containers 
В Angular IoC Container представлен сервисом Dependency Injection (DI). Этот контейнер отвечает за создание экземпляров зависимостей и их предоставление объектам, которые их запрашивают. Когда компонент или сервис создается в Angular, IoC Container автоматически управляет его зависимостями, предоставляя им нужные зависимости во время создания объекта.

IoC Container (хранит конфигурацию, решает какие зависимости как решать (провайдить)) в Angular обеспечивает следующие преимущества:

1. Управление жизненным циклом: Angular контейнер управляет созданием и уничтожением объектов, обеспечивая их правильное использование и освобождение ресурсов.

2. Инверсия управления: IoC Container позволяет делегировать ответственность за создание и предоставление зависимостей фреймворку, вместо того чтобы создавать их вручную внутри компонентов.

3. Гибкость и тестируемость: Использование IoC Containers упрощает замену реальных зависимостей макетами (mocks) в тестах, а также обеспечивает более гибкое управление зависимостями в приложении.

Виды провайда сервисов:
1. Обычный provide в @NgModule:
  С помощью свойства providers: [Service];

2. useClass:
  providers: [{
    provide: Service,
    useClass: Service,
  }]

  Либо с подменой реализации на наследуемый сервис:
  providers: [{
    provide: Service,
    useClass: BetterService,
  }]

В Injector provider (IoC) был добавлен конфиг;
Когда попросят Service -> верни BetterService

3. useExisting:
  providers: [
    BetterService,  
    {
      provide: Service,
      useClass: BetterService,
    }
  ] - в таком случае будет создано 2 инстанса сервиса

  providers: [
    BetterService,  
    {
      provide: Service,
      useExisting: BetterService,
    }
  ] - в таком случае мы попросим IoC вернуть нам уже существующий инстанс сервиса

4. useValue:
  providers: [
      BetterService,  
      {
        provide: Service,
        useValue: {
          info: (msg: string) => {

          }
        },
      }
      {
        provide: Service,
        useExisting: BetterService,
      }
  ] - можем менять реализацию. В данном случае создали заглушку сервису.

5. SOLID внедряемый интерфейс InjectionToken:

  export interface ServiceConfig {
    title: string;
  }

  export const PAGE_CONFIG = new InjectionToken<PageConfig>('page.config');

  ...
  providers: [ 
    {
      provide: PAGE_CONFIG,
      useValue: {
        title: 'I am a title'
      },
    }
  ] - провайдим интерфейс и добавляем реализацию.


  ...
  constructor(
    @Inject(PAGE_CONFIG) public pageConfig: PageConfig, 
  ) - внедряем сервис с помощью декоратора @Inject;

6. useFactory - нужен для динамических зависимостей сервиса:

  providers: [ 
    {
      provide: FactoryService,
      useFactory: (dep: string) => {
        return new FactoryService(dep)
      },
      deps: ['string']
    }
  ] - добавляем зависимости для сервиса в свойстве deps.

7. Multi Injection:

  export const ADMIN_EMAILS = new InjectionToken<string[]>('admin.emails');

  ...
  providers: [ 
    {
      provide: ADMIN_EMAILS,
      useValue: 'first@mail.ru',
      multi: true,
    },
    {
      provide: ADMIN_EMAILS,
      useValue: 'second@mail.ru',
      multi: true,
    }
  ]

  ...
  constructor(
    @Inject(ADMIN_EMAILS) public adminEmails: string[], 
  ) {
    console.log(adminEmails); // ['first@mail.ru', 'second@mail.ru']
  };



----------------------------------------------------------

Все вышеперечисленные use-методы внедрения можно писать в декораторе @Injectable(), например:

@Injectable(
  providedIn: 'root',
  useFactory: (dep: string) => {
    return new FactoryService(dep)
  },
  deps: ['string']
)
export class FactoryService {
  ...
}


# Иерархия инъекторов.

@Inject() -> Element Injectors -> Module Injectors.

Module Injectors:

![image](https://github.com/an-helper/DI/assets/152205791/6f334dcb-9832-4a21-b2ae-38d1e5709d21)

@NgModule "сильнее" @Injectable, т.е. он может переопределить реализацию.
Например:

@Injectable(
  providedIn: 'root,
)
export class Service {
  title = 'first value';
}


@NgModule({
  providers: [
    provide: Service,
    useValue: {
      title: 'second value'
    }
  ]
}) - при инъекции в компонент title будет равен 'second value'


Element Injectors:

- Каждый @Component создает свой Injector
- Каждая @Directive создает свой Injector
- Injector создается на своем элементе (условно)
- Injectors имеют древовидную связь как DOM
- Элемент создает свой Injector
- Элемент может провайдить сервисы на уровне своего Injector
- Провайд на уровне - новые объекты
- Удаление элемента удалит Injector
- Удаление Injector удалит предоставленные серви

Правила решения зависимостей:

1) Каждая зависимость проходит путь
2) Injector элемента
3) Если нет, то Injector родителя (пока не дойдет до корня)
4) Если нет, то возвращается в первый элемент
5) Поиск в Root Injector
6) Если нет, поиск в Platform Injector
7) Если нет, то переход в NullInjector
8) Если @Optional то null иначе исключение

providers vs viewProviders:

- Если мы хотим совместно использовать один экземпляр сервиса во всем нашем приложении, мы настраиваем его в providers в нашем NgModule.
- Если мы хотим иметь по одному экземпляру сервиса для каждого компонента и предоставлять доступ ко всем дочерним элементам компонента, мы настраиваем его в свойстве providers в нашем декораторе компонентов. Дочерний элемент - это дочерний элемент представления.
- Если мы хотим иметь по одному экземпляру сервиса для каждого компонента и предоставлять доступ только представлению (шаблону) компонента, а не дочерним элементам содержимого компонента, мы настраиваем его в свойстве viewProviders нашего декоратора компонента.
