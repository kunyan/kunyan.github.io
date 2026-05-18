---
title: "使用 Test::More 为 Perl 应用编写单元测试"
excerpt: "本文介绍如何使用 Test::More 为 Perl 应用编写单元测试，包括测试组织方式、常见断言、TAP 测试报告、代码覆盖率以及 Jenkins CI 集成。"
date: 2016-03-20
tags: [Perl, "单元测试", TDD, Jenkins, CI]
cover: "unit-test-in-perl.png"
---

## 前言

单元测试是维护长期运行 Perl 应用的重要组成部分。

本文将介绍：

- 如何安装和使用 `Test::More`
- 如何组织测试文件
- 如何编写基础测试用例
- 常见断言的使用方式
- 如何生成 TAP 测试报告
- 如何统计代码覆盖率
- 如何与 Jenkins CI 集成

---

## 1. 安装 Test::More

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

## 2. 测试文件规范

### 文件命名

测试文件应：

- 以 `Test` 开头
- 以 `.t` 结尾
- 存放于 `t/` 目录下

推荐命名方式：

```text
Test<ModuleName>.t
```

例如：

```text
TestVendorProduct.t
```

### 缩进规范

建议：

- 使用 4 个空格
- 不使用 Tab

在开始编写测试前，请确保编辑器已正确配置。

---

## 3. 创建第一个测试文件

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

输出结果：

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

## 4. 理解 Test Plan

通常情况下，在编写测试文件时，我们会提前知道需要执行多少个测试。

定义测试数量主要有两种方式。

### 固定测试数量

```perl
use Test::More tests => 2;
```

### 使用 `done_testing`

```perl
use Test::More;

# 测试代码...

done_testing(2);
```

如果无法提前确定测试数量，可以直接使用：

```perl
done_testing();
```

---

## 5. 常见断言（Assertions）

### 基础断言

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

### 正则匹配断言

#### like

```perl
like($got, qr/expected/, $test_name);
```

#### unlike

```perl
unlike($got, qr/expected/, $test_name);
```

---

### 比较断言

#### cmp_ok

```perl
cmp_ok($got, $op, $expected, $test_name);

# 等价于：
# ok($got eq $expected);

cmp_ok($got, 'eq', $expected, 'this eq that');
```

---

### 对象与模块断言

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

### 深度比较断言

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

### 其他断言

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

## 6. Diagnostics（调试输出）

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

## 7. 特殊测试块

### SKIP Block

用于跳过某些测试。

```perl
SKIP: {

    skip $why, $how_many if $condition;

    # 正常测试代码
}
```

### TODO Block

用于标记尚未完成的测试。

```perl
TODO: {

    local $TODO = $why if $condition;

    # 正常测试代码
}
```

---

## 8. 与 Jenkins 集成

### 应用环境配置

在 Jenkins 中运行测试之前，需要先正确配置应用运行环境。

很多时候，不同环境会使用不同配置文件，例如：

- Development
- Staging
- Production

Jenkins 中比较常用的配置管理插件：

- [Config File Provider Plugin](https://plugins.jenkins.io/config-file-provider/)

安装完成后：

1. 进入 **Manage Jenkins → Managed files**
2. 添加新的配置文件
3. 在 Job 配置中启用 **Provide Configuration files**
4. 指定目标文件路径

---

## 9. 生成 TAP 测试报告

### 安装 TAP::Harness::Archive

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

### 生成测试报告

创建输出目录并执行：

```shell
mkdir -p output

prove -r t/ --archive output
```

测试结果会生成在 `output/` 目录下。

---

### 在 Jenkins 中发布 TAP 报告

安装 Jenkins TAP 插件：

- [TAP Plugin](https://plugins.jenkins.io/tap/)

在 Jenkins Job 中：

1. 添加 Post-build Action
2. 选择 **Publish TAP Results**
3. 配置测试文件路径：

```text
output/**/*.t
```

---

## 10. 生成代码覆盖率报告

### 安装 Devel::Cover

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

### 安装 Devel::Cover::Report::Clover

该模块通常不包含在系统软件源中。

使用 CPAN 安装：

```shell
cpan install Devel::Cover::Report::Clover
```

现代 Perl 环境更推荐：

```shell
cpanm Devel::Cover::Report::Clover
```

---

### 生成覆盖率报告

```shell
cover --report clover
```

---

### 在 Jenkins 中发布覆盖率报告

安装以下 Jenkins 插件：

- [Clover Plugin](https://plugins.jenkins.io/clover/)
- [HTML Publisher Plugin](https://plugins.jenkins.io/htmlpublisher/)

配置 Jenkins Job：

#### Publish Clover Coverage Report

- Clover report directory: `cover_db`
- Clover report file name: `clover.xml`

#### Publish HTML Reports

- HTML directory to archive: `cover_db`
- Index page: `coverage.html`
- Report title: `Coverage Reports`

---

### Jenkins 构建脚本示例

```shell
prove -r t/ --archive output

cover --report clover
```

---

## 已知问题

### Clover Plugin 404 问题

某些版本的 Jenkins Clover Plugin 存在链接失效问题：

点击 `Coverage Report` 后可能返回 `404`。

因此，本文中同时使用 HTML Publisher Plugin 来发布 HTML 覆盖率报告作为替代方案。

---

## 参考资料

1. [Test::More Documentation](https://metacpan.org/pod/Test::More)
2. [Devel::Cover Documentation](https://metacpan.org/pod/Devel::Cover)
3. [Jenkins TAP Plugin](https://plugins.jenkins.io/tap/)
4. [Jenkins HTML Publisher Plugin](https://plugins.jenkins.io/htmlpublisher/)
5. [Config File Provider Plugin](https://plugins.jenkins.io/config-file-provider/)