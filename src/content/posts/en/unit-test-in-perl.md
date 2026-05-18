---
title: "Unit Testing Perl Applications with Test::More"
excerpt: "Learn how to write unit tests for Perl applications using Test::More, generate TAP reports, measure code coverage, and integrate with Jenkins CI."
date: 2016-03-20
tags: [Perl, "Unit Testing", TDD, Jenkins, CI]
cover: "unit-test-in-perl.png"
---

## Introduction

Unit testing is an important part of maintaining long-lived Perl applications.

In this article, we will walk through:

- Installing and using `Test::More`
- Organizing test files
- Writing basic test cases
- Understanding common assertions
- Generating TAP reports
- Measuring code coverage
- Integrating tests with Jenkins CI

---

## 1. Install Test::More

### Fedora

```shell
sudo dnf install perl-Test-Simple
```

### RHEL

```shell
sudo yum install perl-Test-Simple
```

### Ubuntu

```shell
sudo apt-get install libtest-simple-perl
```

---

## 2. Test File Conventions

### Naming

Test files should:

- Start with `Test`
- End with `.t`
- Be stored in the `t/` directory

Recommended naming convention:

```text
Test<ModuleName>.t
```

Example:

```text
TestVendorProduct.t
```

### Indentation

Use:

- 4 spaces
- No tabs

Make sure your editor is configured correctly before writing tests.

---

## 3. Create Your First Test File

```perl
#!/usr/bin/env perl

use strict;
use warnings;
use Test::More tests => 2;

my $got = 'Hello World';
my $expected = 'Hello World';

is( $got, $expected, 'Say Hello to World' );

my $got2 = 'Hello Moon';
my $expected2 = 'Hello Mars';

is( $got2, $expected2, 'Say Hello to Mars' );
```

Output:

```text
1..2
ok 1 - Say Hello to World
not ok 2 - Say Hello to Mars
#   Failed test 'Say Hello to Mars'
#   at /home/kyan/perl-unittest/t/TestUnitCase.t line 12.
#          got: 'Hello Moon'
#     expected: 'Hello Mars'
# Looks like you failed 1 test of 2.
```

---

## 4. Understanding Test Plans

When writing a test file, you usually know how many tests will be executed.

There are two common ways to define the number of tests.

### Static Test Plan

```perl
use Test::More tests => 2;
```

### Using `done_testing`

```perl
use Test::More;

# Testing code...

done_testing(2);
```

If you do not know how many tests will run in advance, you can simply use:

```perl
done_testing();
```

---

## 5. Common Assertions

### Basic Assertions

#### ok

```perl
ok($got eq $expected, $test_name);
```

#### is

```perl
is($got, $expected, $test_name);
```

#### isnt

```perl
isnt($got, $expected, $test_name);
```

---

### Regular Expression Assertions

#### like

```perl
like($got, qr/expected/, $test_name);
```

#### unlike

```perl
unlike($got, qr/expected/, $test_name);
```

---

### Comparison Assertions

#### cmp_ok

```perl
cmp_ok($got, $op, $expected, $test_name);

# Equivalent to:
# ok($got eq $expected);

cmp_ok($got, 'eq', $expected, 'this eq that');
```

---

### Object and Module Assertions

#### can_ok

```perl
can_ok($module, @methods);
can_ok($object, @methods);
```

#### isa_ok

```perl
isa_ok($object,   $class, $object_name);
isa_ok($subclass, $class, $object_name);
isa_ok($ref,      $type,  $ref_name);
```

#### new_ok

```perl
my $obj = new_ok($class);

my $obj = new_ok($class => \@args);

my $obj = new_ok($class => \@args, $object_name);
```

#### require_ok

```perl
require_ok($module);
require_ok($file);
```

#### use_ok

```perl
BEGIN { use_ok($module); }

BEGIN { use_ok($module, @imports); }
```

---

### Deep Comparison Assertions

#### is_deeply

```perl
is_deeply($got, $expected, $test_name);
```

#### eq_array

```perl
my $is_eq = eq_array(\@got, \@expected);
```

#### eq_hash

```perl
my $is_eq = eq_hash(\%got, \%expected);
```

#### eq_set

```perl
my $is_eq = eq_set(\@got, \@expected);
```

---

### Miscellaneous Assertions

#### pass

```perl
pass($test_name);
```

#### fail

```perl
fail($test_name);
```

#### subtest

```perl
use Test::More tests => 1;

subtest 'An example subtest' => sub {

    plan tests => 2;

    pass('This is a subtest');
    pass('So is this');
};
```

---

## 6. Diagnostics

### diag

```perl
diag(@diagnostic_message);
```

### note

```perl
note(@diagnostic_message);
```

### explain

```perl
my @dump = explain @diagnostic_message;
```

---

## 7. Special Testing Blocks

### SKIP Block

```perl
SKIP: {

    skip $why, $how_many if $condition;

    # Normal testing code goes here
}
```

### TODO Block

```perl
TODO: {

    local $TODO = $why if $condition;

    # Normal testing code goes here
}
```

---

## 8. Continuous Integration with Jenkins

### Application Environment Configuration

Before running tests in Jenkins, your application environment must be configured correctly.

In many cases, configuration files differ between environments such as:

- Development
- Staging
- Production

A useful Jenkins plugin for managing configuration files is:

- [Config File Provider Plugin](https://plugins.jenkins.io/config-file-provider/)

After installing the plugin:

1. Go to **Manage Jenkins → Managed files**
2. Add a new configuration file
3. Configure your Jenkins job
4. Enable **Provide Configuration files**
5. Define the target location where the file should be placed

---

## 9. Generate TAP Test Reports

### Install TAP::Harness::Archive

#### Fedora

```shell
sudo dnf install perl-TAP-Harness-Archive
```

#### RHEL

```shell
sudo yum install perl-TAP-Harness-Archive
```

#### Ubuntu

```shell
sudo apt-get install libtap-harness-archive-perl
```

---

### Generate Test Reports

Create an output directory and run `prove`:

```shell
mkdir -p output

prove -r t/ --archive output
```

You can find the generated test results in the `output/` directory.

---

### Publish TAP Reports in Jenkins

Install the Jenkins TAP plugin:

- [TAP Plugin](https://plugins.jenkins.io/tap/)

Configure your Jenkins job:

1. Add a post-build action
2. Select **Publish TAP Results**
3. Use the following test file pattern:

```text
output/**/*.t
```

---

## 10. Generate Code Coverage Reports

### Install Devel::Cover

#### Fedora

```shell
sudo dnf install perl-Devel-Cover
```

#### RHEL

```shell
sudo yum install perl-Devel-Cover
```

#### Ubuntu

```shell
sudo apt-get install libdevel-cover-perl
```

---

### Install Devel::Cover::Report::Clover

This package is not commonly available through system package managers.

Install it from CPAN:

```shell
cpan install Devel::Cover::Report::Clover
```

Modern alternative:

```shell
cpanm Devel::Cover::Report::Clover
```

---

### Generate Coverage Reports

```shell
cover --report clover
```

---

### Publish Coverage Reports in Jenkins

Install the following Jenkins plugins:

- [Clover Plugin](https://plugins.jenkins.io/clover/)
- [HTML Publisher Plugin](https://plugins.jenkins.io/htmlpublisher/)

Configure your Jenkins job:

#### Publish Clover Coverage Report

- Clover report directory: `cover_db`
- Clover report file name: `clover.xml`

#### Publish HTML Reports

- HTML directory to archive: `cover_db`
- Index page: `coverage.html`
- Report title: `Coverage Reports`

---

### Example Jenkins Build Script

```shell
prove -r t/ --archive output

cover --report clover
```

---

## Known Issues

### Clover Plugin 404 Issue

Some versions of the Jenkins Clover Plugin may generate a broken `Coverage Report` link that returns a `404` error.

As a workaround, you can publish the generated HTML report using the HTML Publisher Plugin instead.

---

## References

1. [Test::More Documentation](https://metacpan.org/pod/Test::More)
2. [Devel::Cover Documentation](https://metacpan.org/pod/Devel::Cover)
3. [Jenkins TAP Plugin](https://plugins.jenkins.io/tap/)
4. [Jenkins HTML Publisher Plugin](https://plugins.jenkins.io/htmlpublisher/)
5. [Config File Provider Plugin](https://plugins.jenkins.io/config-file-provider/)