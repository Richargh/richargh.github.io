# Observe

If you’re getting woke up for an alert, it should actually be an emergency. When that happens, things to think about include: 

* when did this happen
* how quickly is it changing
* how did it change
* and what things in my entire system are correlated with that change.

## 3 Pillars of Observability are not enough

While logs, metrics, and tracing are important, observability strategy ought to be more focused on the core workflows and needs around detection and refinement.

## Metrics

Metrics about individual transactions are less valuable. Application level metrics such as how long a queue is are metrics that are truly useful.

### Fallacies

https://en.wikipedia.org/wiki/Goodhart%27s_law

>@gojkoadzic: "organisations that don't know how to measure what is important will **declare whatever they can measure to be important"** - quote from a documentary on the Vietnam war I watched recently... very relevant for software metrics as well

> "Because we cannot measure the things that have the most meaning, we give the most meaning to the things we can measure." - Fred Hargadon, Dean of Admissions at Stanford and later Princeton

>@mikeveerman: If you don't know how to recognize value, you'll end up measuring time.
  621: >@jacoporomei: This is a particular instance of the general rule: if you don't know how to measure what you want, you'll end up **wanting what you can measure.**

### Pirate Metrics

For what is now being used as a part of agile metrics, you might think this has something to do with piracy. The term pirate metrics comes from the mnemonic term **AARRR** (the pirate rant) to remember the 5 key metrics to measure increasing revenue: Acquisition, Activation, Retention, Referral, and Revenue.